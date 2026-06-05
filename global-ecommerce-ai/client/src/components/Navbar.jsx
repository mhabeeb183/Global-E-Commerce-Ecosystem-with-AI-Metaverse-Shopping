import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";
import LanguageSwitcher from "./LanguageSwitcher";
import VoiceSearch from "./VoiceSearch";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const cartItems = useSelector(
    (state) => state.cart.cartItems
  );

  const { userInfo } = useSelector(
    (state) => state.auth
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const logoutHandler = () => {
    dispatch(logout());
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const role =
    userInfo?.user?.role || userInfo?.role;

  return (
    <nav className="bg-black text-white px-8 py-4 flex justify-between items-center shadow-lg">
      {/* Logo */}
      <Link
        to="/"
        className="text-2xl font-bold text-blue-400"
      >
        Global E-Commerce
      </Link>

      {/* Navigation */}
      <div className="flex gap-4 items-center flex-wrap">
        <Link
          to="/"
          className="hover:text-blue-400"
        >
         {t("home")}
        </Link>

        <Link
          to="/"
          className="hover:text-blue-400"
        >
          {t("products")}
        </Link>

        {userInfo && (
          <>
            <Link
              to="/myorders"
              className="hover:text-blue-400"
            >
              {t("myOrders")}
            </Link>

            <Link
              to="/wishlist"
              className="hover:text-pink-400"
            >
              ❤️ {t("wishlist")}
            </Link>

            <Link
              to="/wallet"
              className="hover:text-green-400"
            >
              💰 {t("wallet")}
            </Link>

            <Link to="/subscriptions">
              {t("subscriptions")}
            </Link>
            <Link
              to="/my-coupons"
              className="hover:text-blue-500"
            >
              {t("myCoupons")}
            </Link>

          </>
        )}

        {/* Public Feature Links */}
        <Link
          to="/auctions"
          className="hover:text-yellow-400"
        >
          🔨 {t("auctions")}
        </Link>
        <Link
          to="/livestreams"
          className="hover:text-red-400"
        >
          📺 {t("liveStreams")}
        </Link>

        {/* Vendor Links */}
        {role === "vendor" && (
          <>
            <Link
              to="/vendor"
              className="hover:text-yellow-400"
            >
              {t("vendorDashboard")}
            </Link>

            <Link
              to="/vendor-orders"
              className="hover:text-green-400"
            >
              {t("vendorOrders")}
            </Link>

            <Link
              to="/vendor/earnings"
              className="hover:text-cyan-400"
            >
              {t("vendorEarnings")}
            </Link>

            <Link
              to="/vendor/withdrawals"
              className="hover:text-orange-400"
            >
              {t("vendorWithdrawals")}
            </Link>
              <Link
                to="/vendor/pricing"
                className="hover:text-pink-400"
              >
                {t("dynamicPricing")}
              </Link>
          </>
        )}

        {/* Admin Links */}
        {role === "admin" && (
          <>
            <Link
              to="/admin/dashboard"
              className="hover:text-purple-400"
            >
              {t("adminDashboard")}
            </Link>

            <Link
              to="/admin-orders"
              className="hover:text-orange-400"
            >
              {t("adminOrders")}
            </Link>

            <Link
              to="/admin/withdrawals"
              className="hover:text-red-400"
              >
              {t("withdrawals")}
            </Link>

            <Link to="/admin/reviews">
              {t("reviews")}
            </Link>
            <Link to="/admin/pricing">
              {t("pricingPanel")}
            </Link>
          <Link
            to="/admin/warehouses"
            className="hover:text-cyan-400"
          >
            🏭 {t("warehouses")}
          </Link>
          <Link
            to="/admin/fraud"
            className="hover:text-red-400"
          >
            🛡️ {t("fraudDetection")}
          </Link>
          </>
        )}
       

        {/* Cart */}
        <div className="relative">
          
          <Link
            to="/cart"
            className="hover:text-blue-400"
          >
            🛒 {t("cart")}
          </Link>

          {cartItems.length > 0 && (
            <span className="absolute -top-3 -right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {cartItems.length}
            </span>
          )}
        </div>
 <LanguageSwitcher />
        <VoiceSearch onSearch={(text) => navigate(`/?search=${encodeURIComponent(text)}`)} />
        {/* User Section */}
        {userInfo ? (
          <>
            <span className="text-green-400 font-semibold">
              {userInfo.user?.name ||
                userInfo.name}
            </span>

            <button
              onClick={logoutHandler}
              className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              {t("logout")}
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              {t("login")}
            </Link>

            <Link
              to="/register"
              className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition"
            >
              {t("register")}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
