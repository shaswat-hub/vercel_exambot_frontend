import { useState, useEffect } from "react";
import axios from "axios";
import { LogIn, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ads, setAds] = useState({
    left1: { imageUrl: "", linkUrl: "" },
    left2: { imageUrl: "", linkUrl: "" },
    right1: { imageUrl: "", linkUrl: "" },
    right2: { imageUrl: "", linkUrl: "" },
    top: { imageUrl: "", linkUrl: "" },
    bottom: { imageUrl: "", linkUrl: "" },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAds();
    }
  }, [isAuthenticated]);

  const fetchAds = async () => {
    try {
      const response = await axios.get(`${API}/ads`);
      setAds(response.data);
    } catch (error) {
      console.error("Error fetching ads:", error);
      toast.error("Failed to load ads");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/admin/login`, {
        username,
        password,
      });

      if (response.data.success) {
        setIsAuthenticated(true);
        toast.success("Login successful!");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleAdChange = (adKey, field, value) => {
    setAds((prev) => ({
      ...prev,
      [adKey]: {
        ...prev[adKey],
        [field]: value,
      },
    }));
  };

  const handleSaveAds = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/ads/update`, ads);
      toast.success("Ads updated successfully!");
    } catch (error) {
      console.error("Error updating ads:", error);
      toast.error("Failed to update ads");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Card className="w-full max-w-md shadow-xl" data-testid="login-card">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="mt-1"
                  data-testid="username-input"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                  data-testid="password-input"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                data-testid="login-submit-btn"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const adBlocks = [
    { key: "left1", label: "Left Ad 1" },
    { key: "left2", label: "Left Ad 2" },
    { key: "right1", label: "Right Ad 1" },
    { key: "right2", label: "Right Ad 2" },
    { key: "top", label: "Mobile Top Ad" },
    { key: "bottom", label: "Mobile Bottom Ad" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage your advertisement blocks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adBlocks.map(({ key, label }) => (
            <Card key={key} className="shadow-lg" data-testid={`ad-block-${key}`}>
              <CardHeader>
                <CardTitle className="text-xl">{label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ads[key].imageUrl && (
                  <div className="mb-4">
                    <img
                      src={ads[key].imageUrl}
                      alt={label}
                      className="w-full h-48 object-cover rounded-lg"
                      data-testid={`ad-preview-${key}`}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor={`${key}-image`}>Image URL</Label>
                  <Input
                    id={`${key}-image`}
                    type="url"
                    value={ads[key].imageUrl}
                    onChange={(e) =>
                      handleAdChange(key, "imageUrl", e.target.value)
                    }
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                    data-testid={`ad-image-input-${key}`}
                  />
                </div>
                <div>
                  <Label htmlFor={`${key}-link`}>Link URL</Label>
                  <Input
                    id={`${key}-link`}
                    type="url"
                    value={ads[key].linkUrl}
                    onChange={(e) =>
                      handleAdChange(key, "linkUrl", e.target.value)
                    }
                    placeholder="https://example.com"
                    className="mt-1"
                    data-testid={`ad-link-input-${key}`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={handleSaveAds}
            disabled={loading}
            size="lg"
            className="px-8"
            data-testid="save-ads-btn"
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;