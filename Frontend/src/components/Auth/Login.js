import { useState } from "react"
import { useNavigate, Link as RouterLink } from "react-router-dom"
import { Container, Box, Typography, TextField, Button, Link, Paper } from "@mui/material"
import CircularProgress from "@mui/material/CircularProgress"
import { useAuth } from "../../context/AuthContext"
import axios from "axios"
import API_URL from "../../config"
import { useSnackbar } from "../../context/SnackbarContext"

const Login = () => {
  // Form state management
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const showSnackbar = useSnackbar()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }
// Login form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(formData.email, formData.password)
      navigate("/vehicles")
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again."
      showSnackbar(msg, "error")
    } finally {
      setLoading(false)
    }
  }
// Forgot password submission
  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email: forgotEmail })
      const msg = "If an account exists for this email, a reset link has been sent."
      showSnackbar(msg, "info")
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send reset email."
      showSnackbar(msg, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          marginTop: { xs: 4, sm: 8 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "center", md: "center" },
          justifyContent: { xs: "center", md: "center" },
          gap: { xs: 3, md: 4 },
          minHeight: { md: "60vh" },
          position: "relative",
        }}
      >
        {/* Demo credentials panel */}
        <Box
          sx={{
            order: { xs: 2, md: 1 },
            width: { xs: "100%", md: "auto" },
            maxWidth: { xs: "100%", sm: 400, md: 300 },
            position: { xs: "static", md: "absolute" },
            left: { md: "calc(50% - 250px)" }, 
            transform: { md: "translateX(-100%)" },
          }}
        >
          <Paper
            elevation={2}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="subtitle2"
              gutterBottom
              align="center"
              sx={{
                fontWeight: "bold",
                color: "primary.main",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Demo Credentials
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                mb: 0.5,
              }}
            >
              Email: admin@example.com
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              Password: admin@123
            </Typography>
          </Paper>
        </Box>
        {/* Main login form */}
        <Box
          sx={{
            order: { xs: 1, md: 2 },
            width: { xs: "100%", md: "auto" },
            position: { md: "relative" },
            zIndex: 1,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 4 },
              width: "100%",
              maxWidth: { xs: "100%", sm: 400 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: 2,
            }}
          >
            <Typography component="h1" variant="h5" sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>
              Sign in
            </Typography>

            {showForgot ? (
              <Box component="form" onSubmit={handleForgotSubmit} sx={{ mt: 1, width: "100%" }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="forgotEmail"
                  label="Email Address"
                  name="forgotEmail"
                  autoComplete="email"
                  autoFocus
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: { xs: 1, sm: 1.5 } }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : "Send Reset Link"}
                </Button>
                <Button fullWidth variant="text" onClick={() => setShowForgot(false)} disabled={loading}>
                  Back to Login
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: "100%" }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: { xs: 1, sm: 1.5 } }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : "Sign In"}
                </Button>
                <Button fullWidth variant="text" onClick={() => setShowForgot(true)} disabled={loading}>
                  Forgot Password?
                </Button>
                <Box sx={{ mt: 3, textAlign: "center" }}>
                  <Link component={RouterLink} to="/register" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Container>
  )
}

export default Login
