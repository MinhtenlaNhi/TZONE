import { apiFetchJson, apiPath } from "./base";

export async function fetchCart() {
  return apiFetchJson(apiPath("/api/cart"));
}

export async function addToCart(courseId) {
  return apiFetchJson(apiPath("/api/cart/add"), {
    method: "POST",
    body: JSON.stringify({ courseId })
  });
}

export async function removeFromCart(courseId) {
  return apiFetchJson(apiPath(`/api/cart/${courseId}`), {
    method: "DELETE"
  });
}
