import { useAuthStore } from "../../auth/store/authStore";
import { requestErrorMessage } from "../../../shared/lib/requestError";
import { ProductImage } from "../../../shared/components/ui/ProductImage";
import { useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { useCart } from "../../cart/hooks/useCart";
import { useCreateOrder } from "../../orders/hooks/useOrders";
import { isUnavailable } from "../../cart/services/cartService";
import type { ShippingAddress } from "../../orders/types/order.types";

type AddressField = keyof ShippingAddress;
type AddressErrors = Partial<Record<AddressField, string>>;

const initialAddress: ShippingAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  province: "",
  postalCode: "",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);

const validateAddress = (address: ShippingAddress): AddressErrors => {
  const errors: AddressErrors = {};

  const requiredFields: AddressField[] = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "province",
    "postalCode",
  ];

  for (const field of requiredFields) {
    const value = address[field]?.trim() ?? "";

    if (!value) {
      errors[field] = "This field is required.";
    } else if (value.length > 200) {
      errors[field] = "Must not exceed 200 characters.";
    }
  }

  if ((address.addressLine2?.trim().length ?? 0) > 200) {
    errors.addressLine2 = "Must not exceed 200 characters.";
  }

  if (address.phone.trim() && !/^09\d{9}$/.test(address.phone.trim())) {
    errors.phone = "Enter a valid 11-digit PH mobile number.";
  }

  if (address.postalCode.trim() && !/^\d{4}$/.test(address.postalCode.trim())) {
    errors.postalCode = "Enter a valid 4-digit postal code.";
  }

  return errors;
};

const CheckoutPage = () => {
  const navigate = useNavigate();

  const {
    data: cart,
    isLoading,
    isError,
    refetch,
    isUpdating,
    isFetching,
  } = useCart();

  const createOrder = useCreateOrder();
  const submittingRef = useRef(false);

  const [address, setAddress] = useState<ShippingAddress>(initialAddress);

  const [errors, setErrors] = useState<AddressErrors>({});
  const [submitError, setSubmitError] = useState("");

  const items = useMemo(() => cart?.items ?? [], [cart]);
  const unavailable = items.some(isUnavailable);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
        0,
      ),
    [items],
  );

  const shippingFee = 0;
  const total = subtotal + shippingFee;

  const updateField = (field: AddressField, value: string) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));

    setSubmitError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      submittingRef.current ||
      createOrder.isPending ||
      isUpdating ||
      isFetching
    ) {
      return;
    }

    const nextErrors = validateAddress(address);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    if (items.length === 0) {
      setSubmitError("Your cart is empty.");
      return;
    }
    if (!cart?._id || unavailable) {
      setSubmitError(
        "Some items are unavailable. Return to your cart to review or remove them.",
      );
      return;
    }

    const submittedToken = useAuthStore.getState().token;
    submittingRef.current = true;
    setSubmitError("");

    try {
      const order = await createOrder.mutateAsync({
        cartId: cart._id,
        version: cart.version,
        shippingAddress: {
          fullName: address.fullName.trim(),
          phone: address.phone.trim(),
          addressLine1: address.addressLine1.trim(),
          addressLine2: address.addressLine2?.trim(),
          city: address.city.trim(),
          province: address.province.trim(),
          postalCode: address.postalCode.trim(),
        },
        paymentMethod: "COD",
      });

      if (submittedToken !== useAuthStore.getState().token) return;
      navigate(`/orders/${order._id}`, {
        replace: true,
      });
    } catch (error) {
      setSubmitError(
        requestErrorMessage(
          error,
          "Unable to confirm this order. Check My Orders before placing it again.",
        ),
      );
    } finally {
      submittingRef.current = false;
    }
  };

  const inputClass = (field: AddressField) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900
     outline-none transition placeholder:text-slate-400 focus:ring-4 ${
       errors[field]
         ? "border-red-400 focus:border-red-500 focus:ring-red-50"
         : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-50"
     }`;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">
            Preparing your checkout...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <Package className="mx-auto h-12 w-12 text-slate-400" />

        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          Unable to load your cart
        </h1>

        <p className="mt-2 text-slate-500">
          Please try again before proceeding to checkout.
        </p>

        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <ShoppingBag className="mx-auto h-14 w-14 text-slate-300" />

        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          Your cart is empty
        </h1>

        <p className="mt-2 text-slate-500">
          Add some products before proceeding to checkout.
        </p>

        <Link
          to="/products"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Continue Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/80 pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </Link>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                Secure Checkout
              </p>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Complete your order
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Fill out your shipping details to place your order.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              Secure checkout
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_390px]"
        >
          {/* Shipping form */}
          <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Shipping address
                  </h2>
                  <p className="text-xs text-slate-500">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="grid gap-5 p-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full name *
                  </label>

                  <input
                    id="fullName"
                    autoComplete="name"
                    value={address.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Juan Dela Cruz"
                    className={inputClass("fullName")}
                    aria-invalid={Boolean(errors.fullName)}
                  />

                  {errors.fullName && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Mobile number *
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={address.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="09171234567"
                    className={inputClass("phone")}
                    aria-invalid={Boolean(errors.phone)}
                  />

                  {errors.phone && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="addressLine1"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Street address *
                  </label>

                  <input
                    id="addressLine1"
                    autoComplete="address-line1"
                    value={address.addressLine1}
                    onChange={(e) =>
                      updateField("addressLine1", e.target.value)
                    }
                    placeholder="House number, street, building"
                    className={inputClass("addressLine1")}
                    aria-invalid={Boolean(errors.addressLine1)}
                  />

                  {errors.addressLine1 && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.addressLine1}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="addressLine2"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Barangay / Unit / Landmark
                    <span className="ml-1 font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <input
                    id="addressLine2"
                    autoComplete="address-line2"
                    value={address.addressLine2 ?? ""}
                    onChange={(e) =>
                      updateField("addressLine2", e.target.value)
                    }
                    placeholder="Barangay, apartment, nearby landmark"
                    className={inputClass("addressLine2")}
                    aria-invalid={Boolean(errors.addressLine2)}
                  />

                  {errors.addressLine2 && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.addressLine2}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    City / Municipality *
                  </label>

                  <input
                    id="city"
                    autoComplete="address-level2"
                    value={address.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Dagupan"
                    className={inputClass("city")}
                    aria-invalid={Boolean(errors.city)}
                  />

                  {errors.city && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="province"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Province *
                  </label>

                  <input
                    id="province"
                    autoComplete="address-level1"
                    value={address.province}
                    onChange={(e) => updateField("province", e.target.value)}
                    placeholder="Pangasinan"
                    className={inputClass("province")}
                    aria-invalid={Boolean(errors.province)}
                  />

                  {errors.province && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.province}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="postalCode"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Postal code *
                  </label>

                  <input
                    id="postalCode"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    value={address.postalCode}
                    onChange={(e) => updateField("postalCode", e.target.value)}
                    placeholder="2400"
                    className={inputClass("postalCode")}
                    aria-invalid={Boolean(errors.postalCode)}
                  />

                  {errors.postalCode && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.postalCode}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Payment method */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <LockKeyhole className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Payment method
                  </h2>
                  <p className="text-xs text-slate-500">
                    Available payment option
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 rounded-xl border-2 border-indigo-500 bg-indigo-50/50 p-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-indigo-600">
                    <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      Cash on Delivery
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Pay when your order arrives.
                    </p>
                  </div>

                  <Truck className="h-6 w-6 text-indigo-600" />
                </div>

                <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  No online payment required.
                </p>
              </div>
            </section>
          </div>

          {/* Order summary */}
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Order summary
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {items.length} product
                  {items.length !== 1 ? "s" : ""} in your cart
                </p>
              </div>

              <div className="max-h-80 space-y-5 overflow-y-auto p-6">
                {items.map((item) => {
                  const image =
                    item.product?.images?.find((img) => img.isPrimary)?.url ??
                    item.product?.images?.[0]?.url;

                  return (
                    <div
                      key={item.productId}
                      className="flex items-start gap-4"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                        {image ? (
                          <ProductImage
                            src={image}
                            alt={item.product?.name ?? "Unavailable product"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="m-auto h-full w-8 text-slate-300" />
                        )}

                        <span className="absolute right-0 top-0 flex h-6 min-w-6 items-center justify-center rounded-bl-lg bg-slate-900 px-1 text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                          {item.product?.name ?? "Product no longer available"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Qty: {item.quantity}
                        </p>

                        <p className="mt-2 text-sm font-bold text-slate-900">
                          {isUnavailable(item)
                            ? "Unavailable — review your cart"
                            : formatCurrency(
                                (item.product?.price ?? 0) * item.quantity,
                              )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 border-t border-slate-100 px-6 py-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping</span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>

                <div className="my-4 border-t border-dashed border-slate-200" />

                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">
                    Total
                  </span>
                  <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                    {formatCurrency(total)}
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Final price and stock are confirmed when your order is placed.
                </p>

                {unavailable && (
                  <p
                    role="alert"
                    className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                  >
                    Some items are unavailable.{" "}
                    <Link to="/cart" className="font-semibold underline">
                      Review and remove them in your cart
                    </Link>{" "}
                    before placing an order.
                  </p>
                )}
                {submitError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    createOrder.isPending ||
                    unavailable ||
                    isUpdating ||
                    isFetching
                  }
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createOrder.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Placing your order...
                    </>
                  ) : (
                    <>
                      Place Order
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 pt-2 text-xs text-slate-400">
                  <ShieldCheck className="h-4 w-4" />
                  Your order details are securely submitted.
                </div>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
};

export default CheckoutPage;
