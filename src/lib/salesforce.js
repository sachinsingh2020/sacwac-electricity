/**
 * Salesforce REST API client supporting OAuth 2.0 Client Credentials flow
 * and standard sObject CRUD & SOQL operations.
 */

let cachedToken = null;
let tokenExpiresAt = 0;

export function isSalesforceConfigured() {
  return Boolean(
    process.env.SALESFORCE_CLIENT_ID &&
    process.env.SALESFORCE_CLIENT_SECRET &&
    process.env.SALESFORCE_CLIENT_ID !== 'your_external_client_app_client_id'
  );
}

/**
 * Obtains an access token using OAuth 2.0 Client Credentials Flow
 */
export async function getSalesforceAccessToken() {
  const loginUrl = (process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com').replace(/\/$/, '');
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Salesforce credentials (SALESFORCE_CLIENT_ID, SALESFORCE_CLIENT_SECRET) are not configured.');
  }

  // Return cached token if valid (cache for 1 hour or until 5 mins before expiry)
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + 300000) {
    return cachedToken;
  }

  const tokenUrl = `${loginUrl}/services/oauth2/token`;
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorDetail = errorText;
    try {
      const parsed = JSON.parse(errorText);
      errorDetail = parsed.error_description || parsed.error || errorText;
    } catch (_) {}
    throw new Error(`Salesforce authentication failed: ${errorDetail} (Status: ${res.status})`);
  }

  const data = await res.json();
  cachedToken = {
    accessToken: data.access_token,
    instanceUrl: data.instance_url,
  };
  // Salesforce tokens are usually valid for 2 hours; set 1.5 hr cache
  tokenExpiresAt = now + 90 * 60 * 1000;

  return cachedToken;
}

/**
 * Executes a SOQL query against Salesforce REST API
 */
export async function querySalesforce(soql) {
  const { accessToken, instanceUrl } = await getSalesforceAccessToken();
  const url = `${instanceUrl}/services/data/v60.0/query?q=${encodeURIComponent(soql)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error[0]?.message || 'Failed to execute SOQL query');
  }

  return await res.json();
}

/**
 * Inserts a new record in Salesforce
 */
export async function createSalesforceRecord(sObjectName, data) {
  const { accessToken, instanceUrl } = await getSalesforceAccessToken();
  const url = `${instanceUrl}/services/data/v60.0/sobjects/${sObjectName}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error[0]?.message || `Failed to create ${sObjectName} record`);
  }

  return await res.json(); // { id: "...", success: true, errors: [] }
}

/**
 * Updates an existing record in Salesforce
 */
export async function updateSalesforceRecord(sObjectName, id, data) {
  const { accessToken, instanceUrl } = await getSalesforceAccessToken();
  const url = `${instanceUrl}/services/data/v60.0/sobjects/${sObjectName}/${id}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok && res.status !== 204) {
    const error = await res.json();
    throw new Error(error[0]?.message || `Failed to update ${sObjectName} record`);
  }

  return { success: true, id };
}

/**
 * Deletes a record in Salesforce
 */
export async function deleteSalesforceRecord(sObjectName, id) {
  const { accessToken, instanceUrl } = await getSalesforceAccessToken();
  const url = `${instanceUrl}/services/data/v60.0/sobjects/${sObjectName}/${id}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    const error = await res.json();
    throw new Error(error[0]?.message || `Failed to delete ${sObjectName} record`);
  }

  return { success: true, id };
}
