# Test Accounts for Attaqwa Masjid Digital Ecosystem

## 🔐 Test User Accounts

The database has been seeded with the following test accounts for different roles and scenarios:

### 👑 Admin Accounts (ADMIN Role)

#### 1. System Administrator
- **Email**: `texminer8@gmail.com`
- **Password**: `Pass1word`
- **Name**: System Administrator
- **Age Tier**: ADULTS
- **Description**: Primary admin account for system-level operations

#### 2. Masjid Administrator  
- **Email**: `admin@attaqwa.org`
- **Password**: `admin123`
- **Name**: Masjid Administrator
- **Age Tier**: ADULTS
- **Description**: Masjid management admin account

### 👥 Moderator Accounts (MODERATOR Role)

#### 3. Community Moderator
- **Email**: `moderator@attaqwa.org`
- **Password**: `moderator123`
- **Name**: Community Moderator
- **Age Tier**: ADULTS
- **Description**: Content moderation and community management

#### 4. Imam Account
- **Email**: `imam@attaqwa.org`
- **Password**: `imam123`
- **Name**: Imam Mohammad Zahirul Islam
- **Age Tier**: ADULTS
- **Description**: Religious authority and educational content management

### 🧑‍🤝‍🧑 User Accounts (USER Role)

#### 5. General Community Member
- **Email**: `user@attaqwa.org`
- **Password**: `user123`
- **Name**: Community Member
- **Age Tier**: ADULTS
- **Description**: Standard community member access

#### 6. Parent User
- **Email**: `parent@attaqwa.org`
- **Password**: `parent123`
- **Name**: Parent User
- **Age Tier**: ADULTS
- **Description**: Parent with access to family/children features

#### 7. Student Account
- **Email**: `student@attaqwa.org`
- **Password**: `student123`
- **Name**: Young Student
- **Age Tier**: YOUTH
- **Description**: Youth account for age-appropriate content

## 🎯 Testing Scenarios

### Role-Based Access Testing
1. **Admin Features**: Use `texminer8@gmail.com` or `admin@attaqwa.org`
   - User management
   - System configuration
   - Content management
   - Prayer times administration

2. **Moderation Features**: Use `moderator@attaqwa.org` or `imam@attaqwa.org`
   - Content approval
   - Community management
   - Educational content creation
   - Event management

3. **User Experience**: Use `user@attaqwa.org`, `parent@attaqwa.org`, or `student@attaqwa.org`
   - Prayer times viewing
   - Educational content access
   - Community features
   - Age-appropriate content filtering

### Age Tier Testing
- **ADULTS**: All adult accounts for full content access
- **YOUTH**: `student@attaqwa.org` for age-filtered content

## 🚀 Access URLs

- **Web Application**: http://localhost:3000
- **API Backend**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3000/admin (Admin/Moderator only)

## 🔧 Development Notes

- All passwords are bcrypt hashed with 12 rounds
- Role-based access control implemented
- Age tier filtering for educational content
- Islamic community features fully integrated

## 🌟 Features to Test

1. **Authentication & Authorization**
   - Login with different roles
   - Access control for admin features
   - JWT token management

2. **Islamic Services**
   - Prayer times with 5-layer fallback system
   - Educational content with age filtering
   - Community announcements and events

3. **User Experience**
   - Islamic design system
   - Responsive web interface
   - Role-appropriate content display

4. **Administrative Features**
   - User management (Admin only)
   - Content moderation (Moderator+)
   - System monitoring and health checks