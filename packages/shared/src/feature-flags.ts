/**
 * Feature Flags for Safe Educational System Deployment
 * Used to control educational feature rollout and maintain system stability
 */

export interface FeatureFlags {
  EDUCATION_SYSTEM: boolean;
  EDUCATION_API: boolean; 
  EDUCATION_FRONTEND: boolean;
  EDUCATION_ADMIN: boolean;
  EDUCATION_QUIZ: boolean;
  EDUCATION_PROGRESS: boolean;
}

// Current feature flag state - ENABLING WORKING FEATURES
export const FEATURE_FLAGS: FeatureFlags = {
  EDUCATION_SYSTEM: true,      // Master toggle for all education features
  EDUCATION_API: true,         // Backend API endpoints - NOW WORKING
  EDUCATION_FRONTEND: true,    // Student-facing UI - READY FOR TESTING
  EDUCATION_ADMIN: true,       // Admin management interface - BASIC VERSION
  EDUCATION_QUIZ: false,       // Quiz functionality - COMING SOON
  EDUCATION_PROGRESS: true,    // Progress tracking - BASIC VERSION
};

// Feature flag utility functions
export class FeatureFlagService {
  static isEnabled(flag: keyof FeatureFlags): boolean {
    return FEATURE_FLAGS[flag] === true;
  }

  static isEducationEnabled(): boolean {
    return this.isEnabled('EDUCATION_SYSTEM');
  }

  static canAccessEducationAPI(): boolean {
    return this.isEnabled('EDUCATION_API') && this.isEnabled('EDUCATION_SYSTEM');
  }

  static canAccessEducationUI(): boolean {
    return this.isEnabled('EDUCATION_FRONTEND') && this.isEnabled('EDUCATION_SYSTEM');
  }

  static canAccessEducationAdmin(): boolean {
    return this.isEnabled('EDUCATION_ADMIN') && this.isEnabled('EDUCATION_SYSTEM');
  }
}

// Circuit breaker for broken APIs
export class EducationCircuitBreaker {
  private static failures = 0;
  private static lastFailure = 0;
  private static readonly threshold = 5;
  private static readonly timeout = 60000; // 1 minute

  static isOpen(): boolean {
    const now = Date.now();
    if (this.failures >= this.threshold) {
      if (now - this.lastFailure > this.timeout) {
        this.failures = 0; // Reset after timeout
        return false;
      }
      return true;
    }
    return false;
  }

  static async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Education system temporarily unavailable - circuit breaker open');
    }

    try {
      const result = await fn();
      this.failures = 0; // Reset on success
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailure = Date.now();
      throw error;
    }
  }

  static reset(): void {
    this.failures = 0;
    this.lastFailure = 0;
  }
}