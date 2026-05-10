import { apiFetchJson, apiPath } from "./base";

export async function fetchDashboardStats() {
  return apiFetchJson(apiPath("/api/admin/dashboard"));
}

export async function fetchAdminUsers(page = 1, search = "", role = "") {
  const query = new URLSearchParams({ page });
  if (search) query.append("search", search);
  if (role) query.append("role", role);
  
  return apiFetchJson(apiPath(`/api/admin/users?${query.toString()}`));
}

export async function toggleBlockUser(userId) {
  return apiFetchJson(apiPath(`/api/admin/users/${userId}/toggle-block`), {
    method: "PUT"
  });
}

export async function fetchUserOrders(userId) {
  return apiFetchJson(apiPath(`/api/admin/users/${userId}/orders`));
}
