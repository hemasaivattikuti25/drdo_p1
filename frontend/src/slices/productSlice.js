import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  loading: false,
  product: {},
  error: null
};

export const getProduct = createAsyncThunk(
  'product/getProduct',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/v1/product/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    productRequest: (state) => {
      state.loading = true;
    },
    productSuccess: (state, action) => {
      state.loading = false;
      state.product = action.payload.product;
    },
    productFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createReviewRequest: (state) => {
      state.loading = true;
    },
    createReviewSuccess: (state, action) => {
      state.loading = false;
      state.isReviewSubmitted = true;
    },
    createReviewFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    newProductRequest: (state) => {
      state.loading = true;
    },
    newProductSuccess: (state, action) => {
      state.loading = false;
      state.product = action.payload.product;
      state.isProductCreated = action.payload.success;
    },
    newProductFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isProductCreated = false;
    },
    deleteProductRequest: (state) => {
      state.loading = true;
    },
    deleteProductSuccess: (state, action) => {
      state.loading = false;
      state.isProductDeleted = true;
    },
    deleteProductFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateProductRequest: (state) => {
      state.loading = true;
    },
    updateProductSuccess: (state, action) => {
      state.loading = false;
      state.isProductUpdated = true;
    },
    updateProductFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    reviewsRequest: (state) => {
      state.loading = true;
    },
    reviewsSuccess: (state, action) => {
      state.loading = false;
      state.reviews = action.payload.reviews;
    },
    reviewsFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteReviewRequest: (state) => {
      state.loading = true;
    },
    deleteReviewSuccess: (state, action) => {
      state.loading = false;
      state.isReviewDeleted = true;
    },
    deleteReviewFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearReviewSubmitted: (state) => {
      state.isReviewSubmitted = false;
    },
    clearProductCreated: (state) => {
      state.isProductCreated = false;
    },
    clearProductDeleted: (state) => {
      state.isProductDeleted = false;
    },
    clearProductUpdated: (state) => {
      state.isProductUpdated = false;
    },
    clearReviewDeleted: (state) => {
      state.isReviewDeleted = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearProduct: (state) => {
      state.product = {};
    }
  }
});

export const { 
  productRequest, 
  productSuccess, 
  productFail,
  createReviewRequest,
  createReviewSuccess,
  createReviewFail,
  newProductRequest,
  newProductSuccess,
  newProductFail,
  deleteProductRequest,
  deleteProductSuccess,
  deleteProductFail,
  updateProductRequest,
  updateProductSuccess,
  updateProductFail,
  reviewsRequest,
  reviewsSuccess,
  reviewsFail,
  deleteReviewRequest,
  deleteReviewSuccess,
  deleteReviewFail,
  clearReviewSubmitted,
  clearProductCreated,
  clearProductDeleted,
  clearProductUpdated,
  clearReviewDeleted,
  clearError, 
  clearProduct 
} = productSlice.actions;
export default productSlice.reducer;

