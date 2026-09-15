import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import PublicLayout from "./PublicLayout";
import CatalogPage from "../pages/CatalogPage";
import BrandsPage from "../pages/BrandsPage";
import ProductPage from "../pages/ProductPage";
import SalePage from "../pages/SalePage";
import GuidePage from "../pages/GuidePage";
import AccountPage from "../pages/AccountPage";
import DeliveryPage from "../pages/DeliveryPage";
import NewArrivalsPage from "../pages/NewArrivalsPage";
import CarePage from "../pages/CarePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/catalog",
        element: <CatalogPage />,
      },
      {
        path: "/brands",
        element: <BrandsPage />,
      },
      {
        path: "/product/:slug",
        element: <ProductPage />,
      },
      {
        path: "/new",
        element: <NewArrivalsPage />,
      },
      {
        path: "/care",
        element: <CarePage />,
      },
      {
        path: "/sale",
        element: <SalePage />,
      },
      {
        path: "/guide",
        element: <GuidePage />,
      },
      {
        path: "/account",
        element: <AccountPage />,
      },
      {
        path: "/delivery",
        element: <DeliveryPage />,
      },
    ],
  },
]);
