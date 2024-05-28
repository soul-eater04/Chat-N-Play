import ChatRoom from "./components/ChatRoom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
function App() {
  const router = createBrowserRouter([
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/login",
      element: <Login />,
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
      <RouterProvider router={router} />
    </>
  );
}

export default App;
