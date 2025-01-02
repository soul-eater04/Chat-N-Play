import ChatRoom from "./components/ChatRoom";
import ChessboardComponent from "./components/ChessBoard";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import Signup from "./components/Signup";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
import { AuthProvider } from './components/AuthProvider';

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LandingPage />,
    },
    {
      path: "/chess",
      element: <PrivateRoute><ChessboardComponent /></PrivateRoute>,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/chat",
      element: <PrivateRoute><ChatRoom /></PrivateRoute>,
    },
    {
      path: "*",
      element: (
        <div className="flex flex-col h-screen justify-center items-center">
          <div>no</div>
          <a className=" text-blue-600 underline" href="/signup">
            Signup
          </a>
        </div>
      ),
    },
  ]);
  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  );
}

export default App;
