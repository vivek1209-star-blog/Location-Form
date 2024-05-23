import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  fetchCountries,
  fetchStates,
  fetchCities,
  fetchDistricts,
} from "./Api";
import CustomLoader from "./Components/CustomLoader";

const validationSchema = Yup.object().shape({
  country: Yup.string().required("Country is required"),
  state: Yup.string().required("State is required"),
  district: Yup.string().required("District is required"),
  city: Yup.string().required("City is required"),
});

const App = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0); // Key for forcing re-render

  const getAllCountries = async () => {
    setLoading(true);
    try {
      const response = await fetchCountries();
      setCountries(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch countries:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllCountries();
  }, []);

  const handleChangeCountry = async (value, setFieldValue) => {
    setLoading(true);
    setFieldValue("country", value);
    try {
      const response = await fetchStates(value);
      setStates(response.data.data.states);
      setDistricts([]);
      setCities([]);
      setFieldValue("state", "");
      setFieldValue("district", "");
      setFieldValue("city", "");
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch states:", error);
      setLoading(false);
    }
  };

  const handleChangeState = async (value, setFieldValue, country) => {
    setLoading(true);
    setFieldValue("state", value);
    try {
      const response = await fetchDistricts(country, value);
      setDistricts(response.data.data);
      setCities([]);
      setFieldValue("district", "");
      setFieldValue("city", "");
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch districts:", error);
      setLoading(false);
    }
  };

  const handleChangeDistrict = async (value, setFieldValue, country, state) => {
    setLoading(true);
    setFieldValue("district", value);
    try {
      const response = await fetchCities(country, state, value);
      setCities(response.data.data);
      setFieldValue("city", "");
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch cities:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setValues }
  ) => {
    try {
      console.log(values);
      setSubmitting(false);
      setOpen(true); // Open the success dialog

      // Reset the form and state
      setValues({ country: "", state: "", district: "", city: "" });
      resetForm();
      setCountries([]);
      setStates([]);
      setDistricts([]);
      setCities([]);
      setResetKey((prevKey) => prevKey + 1); // Update key to force re-render of Autocompletes

      // Optionally reload countries if needed right after form reset
      await getAllCountries();
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CustomLoader loading={loading} />
      <Typography
        variant="h6"
        component="header"
        sx={{
          position: "fixed",
          width: "100%",
          top: 0,
          zIndex: 1200,
          bgcolor: "primary.main",
          color: "white",
          padding: "10px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        Location Form
      </Typography>
      <Box
        component="nav"
        sx={{
          position: "fixed",
          top: 56,
          width: 240,
          height: "calc(100% - 56px)",
          bgcolor: "#333333",
          color: "white",
          overflowY: "auto",
        }}
      >
        Sidebar Content
      </Box>

      <Container
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: 30 },
          mt: 8,
          overflowY: "auto",
          padding: "20px",
          bgcolor: "grey.100",
        }}
      >
        <Formik
          initialValues={{ country: "", state: "", district: "", city: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true} // Enable reinitialization
        >
          {({ setFieldValue, values, errors, touched }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Tooltip title="Please select a country first">
                    <div>
                      <Autocomplete
                        key={resetKey}
                        value={values.country || null}
                        options={countries.map((option) => option.name)}
                        getOptionLabel={(option) => option || ""}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Country"
                            fullWidth
                            error={touched.country && Boolean(errors.country)}
                            helperText={touched.country && errors.country}
                          />
                        )}
                        onChange={(event, value) =>
                          handleChangeCountry(value, setFieldValue)
                        }
                      />
                    </div>
                  </Tooltip>
                  <ErrorMessage name="country" component="div" />
                </Grid>
                <Grid item xs={12}>
                  <Tooltip title="Please select a state after selecting a country">
                    <div>
                      <Autocomplete
                        key={resetKey}
                        value={values.state || null}
                        options={states.map((option) => option.name)}
                        getOptionLabel={(option) => option || ""}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="State"
                            fullWidth
                            error={touched.state && Boolean(errors.state)}
                            helperText={touched.state && errors.state}
                          />
                        )}
                        onChange={(event, value) =>
                          handleChangeState(
                            value,
                            setFieldValue,
                            values.country
                          )
                        }
                      />
                    </div>
                  </Tooltip>
                  <ErrorMessage name="state" component="div" />
                </Grid>
                <Grid item xs={12}>
                  <Tooltip title="Please select a district after selecting a state">
                    <div>
                      <Autocomplete
                        key={resetKey}
                        value={values.district || null}
                        options={districts.map((option) => option)}
                        getOptionLabel={(option) => option || ""}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="District"
                            fullWidth
                            error={touched.district && Boolean(errors.district)}
                            helperText={touched.district && errors.district}
                          />
                        )}
                        onChange={(event, value) =>
                          handleChangeDistrict(
                            value,
                            setFieldValue,
                            values.country,
                            values.state
                          )
                        }
                      />
                    </div>
                  </Tooltip>
                  <ErrorMessage name="district" component="div" />
                </Grid>
                <Grid item xs={12}>
                  <Tooltip title="Please select a city after selecting a district">
                    <div>
                      <Autocomplete
                        key={resetKey}
                        value={values.city || null}
                        options={cities.map((option) => option)}
                        getOptionLabel={(option) => option || ""}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="City"
                            fullWidth
                            error={touched.city && Boolean(errors.city)}
                            helperText={touched.city && errors.city}
                          />
                        )}
                        onChange={(event, value) =>
                          setFieldValue("city", value)
                        }
                      />
                    </div>
                  </Tooltip>
                  <ErrorMessage name="city" component="div" />
                </Grid>
              </Grid>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                sx={{ mt: 2 }}
              >
                Submit
              </Button>
            </Form>
          )}
        </Formik>
      </Container>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Form submitted successfully!</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default App;
