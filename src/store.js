import { configureStore } from '@reduxjs/toolkit';
// ...existing imports...

const store = configureStore({
  reducer: {
    // ...existing reducers...
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  // thunk is automatically included
  // ...existing code...
});

// ...existing code...
