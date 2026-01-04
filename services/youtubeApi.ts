import { Channel } from '../types';

const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl';

export class YouTubeService {
  private tokenClient: any;
  private accessToken: string | null = null;

  constructor(private clientId: string) {
    if (window.google) {
      this.initClient();
    }
  }

  private initClient() {
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: this.clientId,
      scope: SCOPES,
      callback: (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          this.accessToken = tokenResponse.access_token;
        }
      },
    });
  }

  public login(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
          // Retry init if script loaded late
          if(window.google) {
              this.initClient();
          } else {
              return reject("Google script not loaded");
          }
      }

      this.tokenClient.callback = (resp: any) => {
        if (resp.error) {
          reject(resp);
        }
        this.accessToken = resp.access_token;
        resolve(resp.access_token);
      };

      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  public async getSubscriptions(): Promise<Channel[]> {
    if (!this.accessToken) throw new Error("Not authenticated");

    let channels: Channel[] = [];
    let nextPageToken: string | undefined = undefined;

    // Loop through all pages to get ALL subscriptions
    do {
      const url = new URL('https://www.googleapis.com/youtube/v3/subscriptions');
      url.searchParams.set('part', 'snippet,contentDetails');
      url.searchParams.set('mine', 'true');
      url.searchParams.set('maxResults', '50');
      url.searchParams.set('access_token', this.accessToken);
      if (nextPageToken) {
        url.searchParams.set('pageToken', nextPageToken);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.error) throw new Error(data.error.message);

      // Transform to our app's Channel format
      const pageChannels = data.items.map((item: any) => ({
        id: item.snippet.resourceId.channelId, // Channel ID needed for unsub
        subscriptionId: item.id, // Subscription ID needed for unsub API
        name: item.snippet.title,
        avatar: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        subscribers: 'Unknown', // Requires extra API call per channel
        lastUpload: 'Unknown', // Requires extra API call per channel
        lastUploadDate: new Date(), // Mock date
        description: item.snippet.description,
        category: 'YouTube',
        isInactive: false, // Default to false as we can't easily check
      }));

      channels = [...channels, ...pageChannels];
      nextPageToken = data.nextPageToken;

    } while (nextPageToken);

    return channels;
  }

  public async unsubscribe(subscriptionId: string): Promise<boolean> {
     if (!this.accessToken) {
       console.error('[API] No access token available');
       return false;
     }

     try {
       const url = `https://www.googleapis.com/youtube/v3/subscriptions?id=${subscriptionId}&access_token=${this.accessToken}`;
       console.log(`[API] DELETE request to: ${url.replace(this.accessToken, 'TOKEN_HIDDEN')}`);

       const response = await fetch(url, {
         method: 'DELETE',
         headers: {
           'Accept': 'application/json',
         }
       });

       console.log(`[API] Response status: ${response.status} ${response.statusText}`);

       if (!response.ok) {
         const errorText = await response.text();
         console.error(`[API] Error response:`, errorText);
         return false;
       }

       return true;
     } catch (error) {
       console.error('[API] Unsubscribe request failed:', error);
       return false;
     }
  }
}

// Helper to check global google object
declare global {
  interface Window {
    google: any;
  }
}