# E-commerce Platform
# hiii i'm reeem 
Modern, scalable e-commerce platform built with Next.js 14, TypeScript, PostgreSQL, and Redis.

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** + **Next.js API Routes**
- **PostgreSQL** - Main database
- **Redis** - Caching and session storage
- **Prisma** - Database ORM

### Frontend
- **Next.js 14** with App Router
- **React 18** + **TypeScript**
- **Tailwind CSS** - Styling

### Authentication & Payments
- **Payload CMS** + **JWT** - Authentication
- **Stripe** + **PAYTHOR** - Payment processing

### Deployment
- **Docker** - Containerization
- **Vercel** - Hosting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd ecommerce-platform
```

### 2. Setup Environment
```bash
# Install dependencies and setup environment
make install

# Update .env.local with your configuration
cp .env.example .env.local
```

### 3. Start Development Environment
```bash
# Complete development setup (database + seed data)
make dev-setup
```

### 4. Start Next.js Application
```bash
npm run dev
```

## 📋 Available Commands

### Development
```bash
make dev-setup     # Complete development setup
make start         # Start all services
make stop          # Stop all services
make restart       # Restart all services
make status        # Show service status
make logs          # View all logs
```

### Database Management
```bash
make migrate       # Run database migrations
make seed          # Seed database with sample data
make reset-db      # Reset database (WARNING: deletes all data)
make backup        # Create database backup
make restore BACKUP_FILE=filename  # Restore from backup
```

### Maintenance
```bash
make clean         # Remove all containers and volumes
make update        # Update Docker images
make monitoring    # Show resource usage
```

## 🔗 Service URLs

### Development Environment
- **Next.js App**: http://localhost:3000
- **pgAdmin**: http://localhost:8082
- **Redis Commander**: http://localhost:8083
- **MailHog**: http://localhost:8025
- **PostgreSQL**: localhost:5433
- **Redis**: localhost:6380

### Production Environment
- **pgAdmin**: http://localhost:8080
- **Redis Commander**: http://localhost:8081
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 📁 Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Database seeding
├── database/
│   └── init/
│       ├── 01_create_tables.sql
│       └── 02_seed_data.sql
├── src/
│   ├── app/                  # Next.js 14 App Router
│   ├── components/           # React components
│   ├── lib/                  # Utilities and configurations
│   └── types/               # TypeScript type definitions
├── docker-compose.yml        # Production Docker setup
├── docker-compose.dev.yml    # Development Docker setup
├── Makefile                 # Project management commands
└── README.md
```

## 🗄️ Database Schema

The platform includes the following main entities:

- **Users** - Customer and admin accounts
- **Products** - Product catalog with categories
- **Orders** - Order management and tracking
- **Cart** - Shopping cart functionality
- **Payments** - Payment processing with Stripe/PAYTHOR
- **Reviews** - Product reviews and ratings
- **Addresses** - Customer shipping/billing addresses

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres_password@localhost:5433/ecommerce_db_dev

# Redis
REDIS_URL=redis://localhost:6380

# Authentication
NEXTAUTH_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# PayThor
PAYTHOR_API_KEY=your-paythor-key
```

## 🐳 Docker Configuration

### Development
```bash
make start        # Uses docker-compose.dev.yml
```

### Production
```bash
ENV=prod make start   # Uses docker-compose.yml
```

## 📊 Database Management

### Access Database
```bash
# Via pgAdmin (Web UI)
# http://localhost:8082 (dev) or http://localhost:8080 (prod)

# Via Command Line
docker exec -it ecommerce_postgres_dev psql -U postgres -d ecommerce_db_dev
```

### Backup & Restore
```bash
# Create backup
make backup

# Restore from backup
make restore BACKUP_FILE=backups/backup_dev_20231120_143022.sql
```

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection prevention with Prisma
- XSS protection
- CSRF protection
- Rate limiting with Redis

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker Production
```bash
ENV=prod make prod-setup
```

## 🤝 Team Collaboration

### Git Workflow
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "Add feature"`
3. Push and create PR: `git push origin feature/your-feature`

### Database Changes
1. Update `prisma/schema.prisma`
2. Run `make migrate`
3. Commit schema changes

## 📈 Monitoring

### View Resource Usage
```bash
make monitoring
```

### View Logs
```bash
make logs         # All services
make logs-db      # Database only
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
make test-db      # Test database connection
make restart      # Restart all services
```

**Port Already in Use**
```bash
make stop         # Stop all services
# Check for conflicting services on ports 5433, 6380, 8082, 8083
```

**Permission Denied**
```bash
sudo chown -R $USER:$USER .
```

## 📝 API Documentation

API endpoints are available at `/api/*`:

- `POST /api/auth/login` - User authentication
- `GET /api/products` - Get products
- `POST /api/orders` - Create order
- `POST /api/payments` - Process payment

## 🔧 Development Tools

- **Prisma Studio**: `npm run db:studio`
- **TypeScript**: `npm run type-check`
- **Linting**: `npm run lint`
- **Database**: `npm run db:migrate`

## 📞 Support

For issues and questions:
1. Check existing GitHub issues
2. Create new issue with detailed description
3. Contact team lead for urgent matters

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.