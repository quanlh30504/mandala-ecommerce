"use client";

import { Toaster, ToastBar, toast } from "react-hot-toast";

const ToastProvider = () => {
  return (
    <Toaster
      position="top-right" // Vị trí hiển thị
      toastOptions={{
        className: "",
        duration: 5000,
        style: {
          background: "#363636",
          color: "#fff",
          padding: '16px',
          borderRadius: '8px',
        },

        success: {
          duration: 3500,
          style: {
            background: '#16a34a', 
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#16a34a',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#dc2626', 
          }
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <>
              {icon}
              {message}
              {t.type !== 'loading' && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit', 
                    cursor: 'pointer',
                    marginLeft: '12px',
                    fontSize: '20px',
                    lineHeight: '1',
                    padding: '0 4px',
                  }}
                >
                  &times; {/* Ký tự 'X' */}
                </button>
              )}
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};

export default ToastProvider;
