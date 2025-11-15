# Smart Photo Album - React Frontend

A modern, responsive React application for the Smart Photo Album with intelligent search capabilities.

## Features

- Modern UI with React and Bootstrap
- Responsive design for all devices
- Natural language photo search
- Drag-and-drop photo upload
- Real-time search results
- Custom label support
- Comprehensive test coverage
- Progressive loading states
- Error handling and validation

## Tech Stack

- **React 18** - UI framework
- **React Bootstrap** - UI components
- **Bootstrap 5** - Styling framework
- **Axios** - HTTP client
- **Jest** - Testing framework
- **React Testing Library** - Component testing

## Getting Started

### Prerequisites

- Node.js 14+ and npm
- AWS account with configured services
- API Gateway endpoint and API key

### Installation

1. Install dependencies:

```bash
cd frontend-react
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` and add your AWS configuration:

```
REACT_APP_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
REACT_APP_API_KEY=your-api-key-here
REACT_APP_PHOTOS_BUCKET=photo-album-storage-your-account-id
REACT_APP_REGION=us-east-1
```

### Running Locally

Start the development server:

```bash
npm start
```

The application will open at `http://localhost:3000`

### Building for Production

Create an optimized production build:

```bash
npm run build
```

The build artifacts will be in the `build/` directory.

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

This will generate a coverage report showing:
- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

### Test Structure

```
src/
├── App.test.js                    # Main app tests
├── components/
│   ├── Header.test.js            # Header component tests
│   ├── SearchSection.test.js     # Search functionality tests
│   ├── UploadSection.test.js     # Upload functionality tests
│   ├── PhotoCard.test.js         # Photo card tests
│   ├── PhotoGallery.test.js      # Gallery tests
│   └── Footer.test.js            # Footer tests
└── services/
    └── api.test.js               # API service tests
```

### Test Coverage Goals

- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

## Deployment

### Deploy to S3

1. Build the production version:

```bash
npm run build
```

2. Upload to S3:

```bash
aws s3 sync build/ s3://your-frontend-bucket-name/ --delete
```

3. Configure S3 for static website hosting:

```bash
aws s3 website s3://your-frontend-bucket-name/ \
  --index-document index.html \
  --error-document index.html
```

### Deploy with CloudFormation

The frontend bucket is created by the CloudFormation template. After stack creation:

```bash
npm run build
aws s3 sync build/ s3://photo-album-frontend-YOUR-ACCOUNT-ID/
```

## Project Structure

```
frontend-react/
├── public/
│   ├── index.html              # HTML template
│   ├── manifest.json           # PWA manifest
│   └── robots.txt              # SEO robots file
├── src/
│   ├── components/             # React components
│   │   ├── Header.js
│   │   ├── SearchSection.js
│   │   ├── UploadSection.js
│   │   ├── PhotoGallery.js
│   │   ├── PhotoCard.js
│   │   └── Footer.js
│   ├── services/               # API services
│   │   └── api.js
│   ├── App.js                  # Main app component
│   ├── App.css                 # Main app styles
│   ├── config.js               # Configuration
│   ├── index.js                # Entry point
│   └── setupTests.js           # Test configuration
├── package.json                # Dependencies
├── .env.example                # Environment template
└── README.md                   # This file
```

## Component Documentation

### Header

Displays the application title and subtitle with gradient background.

### SearchSection

Handles photo search functionality:
- Natural language input
- Loading states
- Error handling
- Results display

### UploadSection

Manages photo uploads:
- File selection
- Custom labels input
- Upload progress
- Success/error feedback

### PhotoGallery

Responsive grid layout for displaying search results.

### PhotoCard

Individual photo card with:
- Image display
- Label badges
- Hover effects
- Error fallback

### Footer

Application footer with course information.

## API Integration

### Search Photos

```javascript
import { searchPhotos } from './services/api';

const results = await searchPhotos('dogs and cats');
```

### Upload Photo

```javascript
import { uploadPhoto } from './services/api';

const file = /* File object */;
const customLabels = 'Sam, Sally';
const result = await uploadPhoto(file, customLabels);
```

## Styling

### Theme Colors

- Primary: `#667eea` (Purple-blue)
- Secondary: `#764ba2` (Purple)
- Background: Linear gradient
- Text: `#333` (Dark gray)

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 992px
- Desktop: > 992px

### Custom CSS

Each component has its own CSS file for modularity:
- `Component.js` → `Component.css`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization

- Code splitting with React.lazy (if needed)
- Image lazy loading
- Optimized bundle size
- Compressed assets
- Cached API responses

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## Troubleshooting

### Issue: API calls fail with CORS error

**Solution:** Ensure API Gateway has CORS enabled for all methods.

### Issue: Images don't load

**Solution:** Check S3 bucket permissions and CORS configuration.

### Issue: Upload fails

**Solution:** Verify API key and bucket name in config.

### Issue: Tests fail

**Solution:** Run `npm install` and ensure all dependencies are installed.

## Contributing

1. Create a feature branch
2. Make changes
3. Write/update tests
4. Ensure all tests pass
5. Submit for review

## License

Educational project for Cloud Computing course.

