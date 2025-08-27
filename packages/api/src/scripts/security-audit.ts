#!/usr/bin/env node
/**
 * Security Audit Script
 * Scans all routes and verifies they have proper authentication and authorization
 */

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { RouteProtection, requiresAuth, getRequiredRole } from '../config/route-protection.js';

interface RouteInfo {
  file: string;
  method: string;
  path: string;
  hasAuth: boolean;
  hasRoleCheck: boolean;
  requiredRoles?: string[];
  issues: string[];
}

const routesDir = join(process.cwd(), 'src', 'routes');
const routes: RouteInfo[] = [];

// Patterns to detect route definitions
const routePatterns = [
  /\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g,
  /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g,
  /app\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g,
];

// Patterns to detect authentication middleware
const authPatterns = [
  /jwt\(\)/,
  /requireAuth/,
  /authMiddleware/,
  /requireRole/,
  /adminOnly/,
  /teacherOrAdmin/,
];

function scanFile(filePath: string): RouteInfo[] {
  const content = readFileSync(filePath, 'utf-8');
  const fileName = filePath.split('/').pop() || '';
  const fileRoutes: RouteInfo[] = [];

  // Extract all routes from the file
  for (const pattern of routePatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      const path = match[2];
      
      // Get the line containing the route definition
      const lineStart = content.lastIndexOf('\n', match.index) + 1;
      const lineEnd = content.indexOf('\n', match.index + match[0].length);
      const routeLine = content.substring(lineStart, lineEnd);
      
      // Check for authentication in the same line or next few lines
      const contextStart = Math.max(0, lineStart - 200);
      const contextEnd = Math.min(content.length, lineEnd + 500);
      const routeContext = content.substring(contextStart, contextEnd);
      
      const hasAuth = authPatterns.some(pattern => pattern.test(routeContext));
      const hasRoleCheck = /requireRole|adminOnly|teacherOrAdmin|moderatorOrHigher/.test(routeContext);
      
      // Determine if this route should be protected
      const shouldRequireAuth = requiresAuth(path);
      const requiredRoles = getRequiredRole(path);
      
      const issues: string[] = [];
      
      // Check for issues
      if (shouldRequireAuth && !hasAuth) {
        issues.push('Missing authentication middleware');
      }
      
      if (requiredRoles && requiredRoles.length > 0 && !hasRoleCheck) {
        issues.push(`Missing role check for: ${requiredRoles.join(', ')}`);
      }
      
      // Check if it's incorrectly protected
      if (!shouldRequireAuth && hasAuth) {
        issues.push('Unnecessary authentication on public route');
      }
      
      fileRoutes.push({
        file: fileName,
        method,
        path,
        hasAuth,
        hasRoleCheck,
        requiredRoles,
        issues,
      });
    }
  }
  
  return fileRoutes;
}

function scanRoutes() {
  console.log('🔍 Starting Security Audit...\n');
  
  const files = readdirSync(routesDir).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
  
  for (const file of files) {
    const filePath = join(routesDir, file);
    const fileRoutes = scanFile(filePath);
    routes.push(...fileRoutes);
  }
  
  // Generate report
  console.log('📊 Security Audit Report');
  console.log('========================\n');
  
  const vulnerableRoutes = routes.filter(r => r.issues.length > 0);
  const protectedRoutes = routes.filter(r => r.hasAuth);
  const publicRoutes = routes.filter(r => !r.hasAuth && r.issues.length === 0);
  
  console.log(`Total Routes: ${routes.length}`);
  console.log(`Protected Routes: ${protectedRoutes.length}`);
  console.log(`Public Routes: ${publicRoutes.length}`);
  console.log(`Routes with Issues: ${vulnerableRoutes.length}\n`);
  
  if (vulnerableRoutes.length > 0) {
    console.log('⚠️  Security Issues Found:');
    console.log('-------------------------\n');
    
    for (const route of vulnerableRoutes) {
      console.log(`❌ ${route.method} ${route.path}`);
      console.log(`   File: ${route.file}`);
      for (const issue of route.issues) {
        console.log(`   - ${issue}`);
      }
      console.log();
    }
  } else {
    console.log('✅ No security issues found!\n');
  }
  
  // List properly protected sensitive routes
  console.log('🛡️  Properly Protected Sensitive Routes:');
  console.log('--------------------------------------\n');
  
  const sensitiveRoutes = routes.filter(r => 
    r.hasAuth && 
    r.issues.length === 0 && 
    (r.path.includes('admin') || r.path.includes('teacher') || r.path.includes('parent'))
  );
  
  for (const route of sensitiveRoutes) {
    console.log(`✅ ${route.method} ${route.path}`);
    if (route.requiredRoles) {
      console.log(`   Roles: ${route.requiredRoles.join(', ')}`);
    }
  }
  
  // Summary
  console.log('\n📈 Summary:');
  console.log('----------');
  
  const score = routes.length > 0 
    ? Math.round((routes.length - vulnerableRoutes.length) / routes.length * 100)
    : 100;
  
  console.log(`Security Score: ${score}%`);
  
  if (score === 100) {
    console.log('🎉 All routes are properly secured!');
  } else if (score >= 80) {
    console.log('👍 Good security, but some improvements needed.');
  } else if (score >= 60) {
    console.log('⚠️  Moderate security issues detected.');
  } else {
    console.log('🚨 Critical security issues detected!');
  }
  
  // Exit with error code if issues found
  if (vulnerableRoutes.length > 0) {
    process.exit(1);
  }
}

// Run the audit
scanRoutes();