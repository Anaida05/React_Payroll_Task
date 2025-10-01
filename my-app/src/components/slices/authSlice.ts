import { toast } from 'react-hot-toast';
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import publicRequest from "../services/publicRequest";
import { LOGIN } from "../services/apiEndPoints";
import { setAccessToken } from "../../utils/utils";

interface AuthState {
  isLoading: boolean;
  hasError: boolean;
  user: null | { id: string };
}

const initialState: AuthState = {
  isLoading: false,
  hasError: false,
  user: null,
};

// ------------------ LOGIN ------------------
export const userLogin = createAsyncThunk<
  boolean, // return type
  { username: string; password: string }, // payload type
  { rejectValue: string } // error type
>("auth/user-login", async (payload, { rejectWithValue }) => {
  try {
    const res = await publicRequest.post(LOGIN, payload);
    if (res?.data?.success) {
      const combined = `${payload.username}:${payload.password}`;
      const base64Encoded = btoa(combined);

      setAccessToken(base64Encoded);
      localStorage.setItem("UserId", res?.data?.userDetail?.data?.UserId);

      toast.success(res?.statusText || "Login successful");
      return true;
    } else {
      const msg =
        res?.data?.errormessage || "Login failed, please try again later";
      console.error(msg);
      toast.error(msg);
      return rejectWithValue(msg);
    }
  } catch (error: any) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "An unknown error occurred. Please try again later.";
    toast.error(msg);
    return rejectWithValue(msg);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(userLogin.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(userLogin.fulfilled, (state, action: PayloadAction<boolean>) => {
        state.isLoading = false;
        state.hasError = false;
        if (action.payload) {
          state.user = { id: localStorage.getItem("UserId") || "" };
        }
      })
      .addCase(userLogin.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      });
  },
});

export default authSlice.reducer;
