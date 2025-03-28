# Metrics Hub

A lightweight, privacy-focused analytics platform for tracking website statistics across multiple projects.

## Features

- **Anonymous Data Collection**: Track visitor metrics without collecting personally identifiable information
- **Multi-Project Support**: Monitor statistics across different websites/applications
- **Custom Dashboard**: Visualize traffic patterns with interactive charts
- **API Integration**: Easy-to-implement tracking script for any website
- **Privacy Compliant**: Designed with GDPR and privacy regulations in mind

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Visualization**: Chart.js with react-chartjs-2
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/OkeahDavid/Metrics-hub.git
   cd metrics-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/metrics_hub"
   ```

4. Initialize the database:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Adding a Project

1. Navigate to your dashboard
2. Create a new project to receive a unique API key
3. Integrate the tracking script into your website/application

### Tracking Script

Add the following script to your website:

```html
<script>
  (function() {
    // Generate a session ID
    let sessionId = localStorage.getItem('metrics_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('metrics_session_id', sessionId);
    }
    
    // Better device detection
    function getDeviceType() {
      const ua = navigator.userAgent;
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
      }
      if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        return 'mobile';
      }
      return 'desktop';
    }
    
    // Send pageview data
    fetch('https://your-metrics-hub.com/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectApiKey: 'YOUR_API_KEY',
        page: window.location.pathname,
        referrer: document.referrer,
        sessionId: sessionId,
        userAgent: navigator.userAgent,
        deviceType: getDeviceType()
      }),
      keepalive: true // Important for preserving requests when page unloads
    }).catch(err => console.error('Analytics error:', err));
  })();
</script>
```

### Viewing Analytics

Access your dashboard to view:
- Page views over time
- Traffic sources
- Geographic distribution
- Device types
- Custom reports

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Privacy

Metrics Hub is designed to be privacy-focused by default:
- No cookies required
- IP addresses are anonymized
- No personal data collection
- Compliant with GDPR and similar regulations