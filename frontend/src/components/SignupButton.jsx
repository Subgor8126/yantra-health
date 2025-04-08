function SignupButton() {
    return (
      <button onClick={() => window.location.href = 'YOUR_COGNITO_URL'}>
        Sign Up
      </button>
    );
  }
  
  export default SignupButton;
  