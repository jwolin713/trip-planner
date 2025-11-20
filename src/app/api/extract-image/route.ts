import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required." },
        { status: 400 }
      );
    }

    // Validate URL format
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format." },
        { status: 400 }
      );
    }

    // Fetch the page
    const response = await fetch(validUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      let errorMsg = "Failed to fetch the listing page.";
      if (response.status === 403) {
        errorMsg = "Access blocked by the website (likely anti-bot protection). Try manually copying the image URL instead.";
      } else if (response.status === 404) {
        errorMsg = "Page not found. Make sure you're using a specific listing URL, not a search results page.";
      } else if (response.status === 429) {
        errorMsg = "Rate limited by the website. VRBO/Airbnb block automated requests. Please manually copy the image URL from the listing page instead.";
      } else {
        errorMsg = `Failed to fetch the listing page (HTTP ${response.status}). Try manually copying the image URL instead.`;
      }
      return NextResponse.json(
        { error: errorMsg },
        { status: 500 }
      );
    }

    const html = await response.text();

    // Extract Open Graph image tag
    // Most listing sites (Airbnb, VRBO, Booking.com, etc.) use og:image
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);

    // Also try og:image:secure_url which some sites use for HTTPS images
    const ogImageSecureMatch = html.match(/<meta\s+property=["']og:image:secure_url["']\s+content=["']([^"']+)["']/i);

    // Try twitter:image as a fallback
    const twitterImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);

    let imageUrl = ogImageMatch?.[1] || ogImageSecureMatch?.[1] || twitterImageMatch?.[1];

    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image found. This may be a search page rather than a specific listing. Try using an individual listing URL or manually enter an image URL." },
        { status: 404 }
      );
    }

    // If the image URL is relative, make it absolute
    if (imageUrl.startsWith('/')) {
      imageUrl = `${validUrl.protocol}//${validUrl.host}${imageUrl}`;
    } else if (imageUrl.startsWith('//')) {
      imageUrl = `https:${imageUrl}`;
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to extract image from listing." },
      { status: 500 }
    );
  }
}
