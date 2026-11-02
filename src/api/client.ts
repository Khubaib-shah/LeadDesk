/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return (data?.data !== undefined ? data.data : data) as T;
}
