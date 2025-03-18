import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  properties: [],
  selectedProperty: null,
  isLoading: false,
  error: null,
};

export const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setProperties: (state, action) => {
      state.properties = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedProperty: (state, action) => {
      state.selectedProperty = action.payload;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const { setProperties, setSelectedProperty, setLoading, setError } = propertySlice.actions;

export const fetchProperties = () => async (dispatch) => {
  try {
    const response = await axios.get('https://prop-backend.vercel.app/v1/property/getProperties');

    dispatch(setProperties(response.data.data));

  } catch (error) {
    dispatch(setError(error.message));
    dispatch(setLoading(false));
  }
};

export const fetchPropertyById = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axios.get(`https://prop-backend.vercel.app/v1/property/getPropertyById/${id}`);
    dispatch(setSelectedProperty(response.data.data));
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError(error.message));
    dispatch(setLoading(false));
  }
};

export const updateProperty = (id, updatedProperty) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axios.put(`https://prop-backend.vercel.app/v1/property/updateProperty/${id}`, updatedProperty, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    fetchProperties();
  } catch (error) {
    dispatch(setError(error.message));
    dispatch(setLoading(false));
  }
};

export const deleteProperty = (propertyId) => async (dispatch) => {
  try {
    const response = await axios.delete(`https://prop-backend.vercel.app/v1/property/deleteProperty/${propertyId}`);
    fetchProperties();
  } catch (error) {
    dispatch(setError(error.message));
    dispatch(setLoading(false));
  }
};    

export const createProperty = (newProperty) => async (dispatch) => {
  try {
    const response = await axios.post('https://prop-backend.vercel.app/v1/property/createProperty', newProperty, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    fetchProperties();
  } catch (error) {
    dispatch(setError(error.message));
    dispatch(setLoading(false));
  }
};

export const selectProperties = (state) => state.property.properties;
export const selectSelectedProperty = (state) => state.property.selectedProperty;
export const selectLoading = (state) => state.property.isLoading;
export const selectError = (state) => state.property.error;

export default propertySlice.reducer; 