import { toast as rht, ToastOptions } from 'react-hot-toast';

const defaultOptions: ToastOptions = { 
    duration: 1500,
    position: "top-right"
};

const success = (msg: string, options: ToastOptions = defaultOptions) => {
    return rht.success(msg, options);
};

const error = (msg: string, options: ToastOptions = defaultOptions) => {
    return rht.error(msg, options);
};

const warning = (msg: string, options: ToastOptions = defaultOptions) => {
    return rht(msg, { ...options, icon: '⚠️' });
};

const toast = {
    success,
    error,
    warning
};

export default toast;
