import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  loading: false,
  products: [],
  error: null,
  productsCount: 0
};

export const getProducts = createAsyncThunk(
  'products/getProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/v1/products');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    productsRequest: (state) => {
      state.loading = true;
      state.products = [];
    },
    productsSuccess: (state, action) => {
      state.loading = false;
      state.products = action.payload.products;
      state.productsCount = action.payload.count;
      state.resPerPage = action.payload.resPerPage;
      state.filteredProductsCount = action.payload.filteredProductsCount;
    },
    productsFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    adminProductsRequest: (state) => {
      state.loading = true;
    },
    adminProductsSuccess: (state, action) => {
      state.loading = false;
      state.products = action.payload.products;
    },
    adminProductsFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { 
  productsRequest, 
  productsSuccess, 
  productsFail,
  adminProductsRequest,
  adminProductsSuccess,
  adminProductsFail,
  clearError 
} = productsSlice.actions;
export default productsSlice.reducer;

