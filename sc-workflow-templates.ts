/**
 * SuperClaude Workflow Templates System
 * 
 * Domain-specific workflow templates for common implementation patterns
 * with Islamic cultural considerations and SuperClaude integration.
 */

import { AnalyzedRequirement, WorkflowPhase, WorkflowTask, SuperClaudePersona, IslamicContext } from './sc-workflow-engine';

// ========================================================================================
// TEMPLATE INTERFACES
// ========================================================================================

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  applicableFor: string[];
  islamicConsiderations: IslamicContext[];
  phases: TemplatePhase[];
  defaultPersonas: SuperClaudePersona[];
  mcpServers: string[];
  estimatedDuration: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
  prerequisites: string[];
  deliverables: string[];
  qualityGates: string[];
  riskFactors: string[];
}

interface TemplatePhase {
  name: string;
  description: string;
  taskTemplates: TaskTemplate[];
  duration: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
  dependencies: string[];
  personas: SuperClaudePersona[];
  mcpServers: string[];
  islamicValidations: string[];
}

interface TaskTemplate {
  title: string;
  description: string;
  complexity: number;
  duration: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
  persona: SuperClaudePersona;
  mcpServers: string[];
  tools: string[];
  acceptanceCriteria: string[];
  islamicRequirements: string[];
  commands: string[];
}

// ========================================================================================
// ISLAMIC FEATURE TEMPLATES
// ========================================================================================

export class IslamicFeatureTemplates {
  static getPrayerTimeTemplate(): WorkflowTemplate {
    return {
      id: 'islamic-prayer-times',
      name: 'Prayer Time Integration',
      description: 'Complete implementation of accurate Islamic prayer time features',
      applicableFor: ['prayer times', 'salah', 'islamic calendar', 'adhan'],
      islamicConsiderations: [
        {
          type: 'prayer-times',
          requirements: [
            'Multiple calculation methods (ISNA, MWL, Egypt, Makkah, Karachi, Tehran, Jafari)',
            'Accurate timezone handling and DST adjustments',
            'Location-based prayer time calculations',
            'Cultural display preferences and formatting'
          ],
          compliance: [
            { category: 'functionality', description: 'Prayer times accurate within 1 minute', mandatory: true },
            { category: 'accessibility', description: 'Support for 12/24 hour time formats', mandatory: true },
            { category: 'design', description: 'Culturally appropriate prayer time display', mandatory: true }
          ]
        }
      ],
      phases: [
        {
          name: 'Prayer Time Foundation',
          description: 'Set up prayer time calculation library and core infrastructure',
          taskTemplates: [
            {
              title: 'Install and configure prayer time calculation library',
              description: 'Research and integrate reliable Islamic prayer time calculation library',
              complexity: 0.4,
              duration: { optimistic: 2, realistic: 4, pessimistic: 6 },
              persona: 'backend',
              mcpServers: ['context7'],
              tools: ['npm', 'Read', 'Write'],
              acceptanceCriteria: [
                'Prayer time library installed and configured',
                'Multiple calculation methods available',
                'Timezone support implemented'
              ],
              islamicRequirements: [
                'Library supports major Islamic calculation methods',
                'Accurate Qibla direction calculation included'
              ],
              commands: [
                '/sc:implement prayer-time-service --persona-backend --c7',
                'npm install adhan-js moment-timezone',
                'Configure calculation methods in constants'
              ]
            },
            {
              title: 'Create prayer time API endpoints',
              description: 'Implement RESTful API for prayer time data retrieval',
              complexity: 0.5,
              duration: { optimistic: 3, realistic: 6, pessimistic: 9 },
              persona: 'backend',
              mcpServers: ['context7', 'sequential'],
              tools: ['Write', 'Edit', 'Bash'],
              acceptanceCriteria: [
                'GET /api/prayer-times endpoint returns accurate times',
                'Location-based queries supported',
                'Multiple format options available',
                'Error handling for invalid locations'
              ],
              islamicRequirements: [
                'All major Islamic calculation methods supported',
                'Prayer time names in Arabic and English',
                'Proper Islamic calendar integration'
              ],
              commands: [
                '/sc:implement api-endpoints --persona-backend --seq',
                'Create Hono.js routes for prayer times',
                'Add input validation and error handling'
              ]
            }
          ],
          duration: { optimistic: 6, realistic: 12, pessimistic: 18 },
          dependencies: [],
          personas: ['backend'],
          mcpServers: ['context7', 'sequential'],
          islamicValidations: [
            'Prayer time calculations verified against known accurate sources',
            'Multiple Islamic calculation methods tested',
            'Timezone handling validated for global use'
          ]
        },
        {
          name: 'Prayer Time UI Implementation',
          description: 'Create responsive Islamic prayer time interface components',
          taskTemplates: [
            {
              title: 'Design prayer time display component',
              description: 'Create beautiful, culturally appropriate prayer time display',
              complexity: 0.6,
              duration: { optimistic: 4, realistic: 8, pessimistic: 12 },
              persona: 'frontend',
              mcpServers: ['magic', 'context7'],
              tools: ['Write', 'Edit'],
              acceptanceCriteria: [
                'Prayer times displayed in clean, readable format',
                'Islamic design system colors and typography used',
                'Responsive design works on all devices',
                'Time format preferences supported'
              ],
              islamicRequirements: [
                'Prayer names in Arabic with transliteration',
                'Islamic green color scheme implemented',
                'Culturally appropriate geometric patterns',
                'Proper respect for Islamic visual guidelines'
              ],
              commands: [
                '/sc:implement prayer-time-widget --persona-frontend --magic',
                'Use Islamic design system colors',
                'Implement Arabic text support with Amiri font'
              ]
            },
            {
              title: 'Add prayer time calculation settings',
              description: 'Allow users to customize calculation methods and preferences',
              complexity: 0.5,
              duration: { optimistic: 3, realistic: 6, pessimistic: 9 },
              persona: 'frontend',
              mcpServers: ['magic'],
              tools: ['Write', 'Edit'],
              acceptanceCriteria: [
                'Users can select preferred calculation method',
                'Location settings configurable',
                'Time format preferences saved',
                'Settings persist across sessions'
              ],
              islamicRequirements: [
                'Calculation methods labeled with Islamic authority names',
                'Educational content about different methods provided',
                'Default settings appropriate for user location'
              ],
              commands: [
                '/sc:implement settings-ui --persona-frontend --magic',
                'Create Islamic calculation method selector',
                'Add location permission handling'
              ]
            }
          ],
          duration: { optimistic: 8, realistic: 16, pessimistic: 24 },
          dependencies: ['Prayer Time Foundation'],
          personas: ['frontend'],
          mcpServers: ['magic', 'context7'],
          islamicValidations: [
            'Arabic prayer names display correctly with RTL support',
            'Islamic design guidelines followed throughout',
            'Cultural sensitivity maintained in all text and imagery'
          ]
        }
      ],
      defaultPersonas: ['backend', 'frontend'],
      mcpServers: ['context7', 'magic', 'sequential'],
      estimatedDuration: { optimistic: 14, realistic: 28, pessimistic: 42 },
      prerequisites: [
        'Next.js project structure in place',
        'Islamic design system implemented',
        'User location permissions handling'
      ],
      deliverables: [
        'Prayer time calculation service',
        'Prayer time API endpoints',
        'Prayer time display components',
        'User preference settings',
        'Cultural compliance validation'
      ],
      qualityGates: [
        'Prayer time accuracy validation',
        'Islamic cultural review',
        'Accessibility compliance check',
        'Mobile responsiveness test'
      ],
      riskFactors: [
        'Timezone handling complexity',
        'Islamic calculation method variations',
        'Location permission issues',
        'Cultural sensitivity requirements'
      ]
    };
  }

  static getArabicTextTemplate(): WorkflowTemplate {
    return {
      id: 'arabic-text-support',
      name: 'Arabic Text & RTL Support',
      description: 'Comprehensive Arabic text support with proper RTL handling and cultural typography',
      applicableFor: ['arabic text', 'rtl support', 'islamic content', 'multilingual'],
      islamicConsiderations: [
        {
          type: 'arabic-text',
          requirements: [
            'Proper RTL text direction support',
            'Amiri font family for Arabic text',
            'Unicode handling for Arabic diacritics',
            'Cultural typography and spacing'
          ],
          compliance: [
            { category: 'design', description: 'Arabic text must use Amiri font', mandatory: true },
            { category: 'accessibility', description: 'Screen readers properly announce RTL text', mandatory: true },
            { category: 'functionality', description: 'Text direction switching works correctly', mandatory: true }
          ]
        }
      ],
      phases: [
        {
          name: 'Font & Typography Setup',
          description: 'Configure proper Arabic fonts and typography system',
          taskTemplates: [
            {
              title: 'Install and configure Amiri font',
              description: 'Set up Amiri font family for authentic Arabic text display',
              complexity: 0.3,
              duration: { optimistic: 1, realistic: 2, pessimistic: 3 },
              persona: 'frontend',
              mcpServers: ['context7'],
              tools: ['Write', 'Edit'],
              acceptanceCriteria: [
                'Amiri font loaded and available',
                'Font loading optimization implemented',
                'Fallback fonts configured'
              ],
              islamicRequirements: [
                'Amiri font used for all Arabic text',
                'Proper weight and style variants available',
                'Cultural authenticity maintained'
              ],
              commands: [
                'Add Amiri font to Next.js font configuration',
                'Configure font loading strategy',
                'Set up CSS custom properties for Arabic typography'
              ]
            },
            {
              title: 'Implement RTL CSS system',
              description: 'Create comprehensive RTL support with logical CSS properties',
              complexity: 0.5,
              duration: { optimistic: 2, realistic: 4, pessimistic: 6 },
              persona: 'frontend',
              mcpServers: ['context7', 'magic'],
              tools: ['Write', 'Edit'],
              acceptanceCriteria: [
                'RTL text direction properly applied',
                'Layout components work in both directions',
                'Margin/padding adjustments for RTL',
                'Icon and UI element positioning correct'
              ],
              islamicRequirements: [
                'Arabic text flows right-to-left naturally',
                'Mixed LTR/RTL content handled properly',
                'Islamic calligraphy and text patterns respected'
              ],
              commands: [
                '/sc:implement rtl-css-system --persona-frontend --magic',
                'Configure Tailwind CSS for RTL support',
                'Test mixed direction content layouts'
              ]
            }
          ],
          duration: { optimistic: 4, realistic: 8, pessimistic: 12 },
          dependencies: [],
          personas: ['frontend'],
          mcpServers: ['context7', 'magic'],
          islamicValidations: [
            'Arabic font rendering validated across browsers',
            'RTL text direction working correctly',
            'Cultural typography standards met'
          ]
        },
        {
          name: 'Content Management & Display',
          description: 'Implement Arabic content management and display components',
          taskTemplates: [
            {
              title: 'Create bilingual content components',
              description: 'Build components that handle Arabic/English content switching',
              complexity: 0.6,
              duration: { optimistic: 4, realistic: 8, pessimistic: 12 },
              persona: 'frontend',
              mcpServers: ['magic', 'sequential'],
              tools: ['Write', 'Edit'],
              acceptanceCriteria: [
                'Seamless language switching functionality',
                'Content state preserved during switches',
                'Proper text direction changes applied',
                'User preference persistence'
              ],
              islamicRequirements: [
                'Arabic content maintains Islamic respectful terminology',
                'Transliteration provided where appropriate',
                'Cultural context preserved in translations'
              ],
              commands: [
                '/sc:implement bilingual-components --persona-frontend --magic',
                'Add language toggle functionality',
                'Implement content translation system'
              ]
            }
          ],
          duration: { optimistic: 6, realistic: 12, pessimistic: 18 },
          dependencies: ['Font & Typography Setup'],
          personas: ['frontend'],
          mcpServers: ['magic', 'sequential'],
          islamicValidations: [
            'Arabic content displays with proper cultural formatting',
            'Language switching maintains user experience quality',
            'Islamic terminology used consistently and respectfully'
          ]
        }
      ],
      defaultPersonas: ['frontend'],
      mcpServers: ['context7', 'magic', 'sequential'],
      estimatedDuration: { optimistic: 10, realistic: 20, pessimistic: 30 },
      prerequisites: [
        'CSS-in-JS or CSS modules setup',
        'Component library foundation',
        'Content management system architecture'
      ],
      deliverables: [
        'Arabic font configuration',
        'RTL CSS system',
        'Bilingual content components',
        'Language switching functionality',
        'Cultural typography guidelines'
      ],
      qualityGates: [
        'Arabic font rendering validation',
        'RTL layout testing',
        'Cross-browser compatibility',
        'Cultural authenticity review'
      ],
      riskFactors: [
        'Font loading performance impact',
        'Complex layout requirements for RTL',
        'Browser compatibility variations',
        'Cultural sensitivity in content translation'
      ]
    };
  }

  static getIslamicContentTemplate(): WorkflowTemplate {
    return {
      id: 'islamic-content-management',
      name: 'Islamic Content Management System',
      description: 'Comprehensive system for managing Islamic educational and religious content',
      applicableFor: ['quran', 'hadith', 'islamic education', 'religious content'],
      islamicConsiderations: [
        {
          type: 'cultural-sensitivity',
          requirements: [
            'Authentic Islamic sources and references',
            'Proper respect for Quranic and Hadith content',
            'Cultural sensitivity in content representation',
            'Age-appropriate Islamic educational material'
          ],
          compliance: [
            { category: 'content', description: 'All Islamic content verified for authenticity', mandatory: true },
            { category: 'design', description: 'Respectful presentation of religious material', mandatory: true },
            { category: 'functionality', description: 'Proper citation and reference system', mandatory: true }
          ]
        }
      ],
      phases: [
        {
          name: 'Content Architecture & Database',
          description: 'Design and implement Islamic content data structures',
          taskTemplates: [
            {
              title: 'Design Islamic content schema',
              description: 'Create comprehensive database schema for Islamic educational content',
              complexity: 0.7,
              duration: { optimistic: 6, realistic: 12, pessimistic: 18 },
              persona: 'architect',
              mcpServers: ['sequential', 'context7'],
              tools: ['Write', 'Edit'],
              acceptanceCriteria: [
                'Content types defined (Quran, Hadith, Educational)',
                'Subject taxonomy implemented (Fiqh, Aqidah, etc.)',
                'Age tier system for appropriate content',
                'Source attribution and verification fields'
              ],
              islamicRequirements: [
                'Quranic verse references (Surah:Ayah format)',
                'Hadith grading system (Sahih, Hasan, etc.)',
                'Islamic subject classification',
                'Scholarly authority attribution'
              ],
              commands: [
                '/sc:implement content-schema --persona-architect --seq',
                'Create Prisma models for Islamic content',
                'Set up enum types for Islamic subjects'
              ]
            },
            {
              title: 'Implement content validation system',
              description: 'Build system to validate Islamic content authenticity and accuracy',
              complexity: 0.6,
              duration: { optimistic: 4, realistic: 8, pessimistic: 12 },
              persona: 'backend',
              mcpServers: ['sequential'],
              tools: ['Write', 'Edit'],
              acceptanceCriteria: [
                'Source citation validation',
                'Content authenticity checks',
                'Cultural sensitivity scoring',
                'Automated content moderation'
              ],
              islamicRequirements: [
                'Quranic references verified against standard texts',
                'Hadith authenticity validation',
                'Islamic terminology consistency checks',
                'Cultural appropriateness assessment'
              ],
              commands: [
                '/sc:implement content-validation --persona-backend --seq',
                'Create validation middleware',
                'Implement Islamic content scoring system'
              ]
            }
          ],
          duration: { optimistic: 12, realistic: 24, pessimistic: 36 },
          dependencies: [],
          personas: ['architect', 'backend'],
          mcpServers: ['sequential', 'context7'],
          islamicValidations: [
            'All Islamic content types properly modeled',
            'Authentication system respects Islamic privacy principles',
            'Content validation maintains religious accuracy'
          ]
        }
      ],
      defaultPersonas: ['architect', 'backend', 'frontend', 'scribe'],
      mcpServers: ['sequential', 'context7', 'magic'],
      estimatedDuration: { optimistic: 20, realistic: 40, pessimistic: 60 },
      prerequisites: [
        'Database infrastructure established',
        'Authentication system implemented',
        'Content management architecture planned'
      ],
      deliverables: [
        'Islamic content database schema',
        'Content validation system',
        'Islamic subject taxonomy',
        'Content management interfaces',
        'Cultural compliance framework'
      ],
      qualityGates: [
        'Islamic content authenticity validation',
        'Cultural sensitivity review',
        'Database performance optimization',
        'Content moderation system testing'
      ],
      riskFactors: [
        'Complex Islamic content requirements',
        'Cultural sensitivity compliance',
        'Source verification challenges',
        'Content authenticity validation complexity'
      ]
    };
  }
}

// ========================================================================================
// TECHNICAL IMPLEMENTATION TEMPLATES
// ========================================================================================

export class TechnicalTemplates {
  static getMonorepoPackageTemplate(): WorkflowTemplate {
    return {
      id: 'monorepo-package-implementation',
      name: 'Monorepo Package Development',
      description: 'Add new package to existing Turborepo monorepo structure',
      applicableFor: ['new package', 'monorepo', 'turborepo', 'shared library'],
      islamicConsiderations: [],
      phases: [
        {
          name: 'Package Foundation',
          description: 'Set up new package structure and configuration',
          taskTemplates: [
            {
              title: 'Create package directory structure',
              description: 'Set up standard package directory with TypeScript configuration',
              complexity: 0.3,
              duration: { optimistic: 1, realistic: 2, pessimistic: 3 },
              persona: 'architect',
              mcpServers: ['context7'],
              tools: ['Bash', 'Write'],
              acceptanceCriteria: [
                'Package directory created in packages/',
                'package.json configured with proper dependencies',
                'TypeScript configuration matches monorepo standards',
                'Turbo configuration updated'
              ],
              islamicRequirements: [],
              commands: [
                'mkdir packages/new-package',
                'Create package.json with workspace dependencies',
                'Configure tsconfig.json extending root config'
              ]
            }
          ],
          duration: { optimistic: 2, realistic: 4, pessimistic: 6 },
          dependencies: [],
          personas: ['architect'],
          mcpServers: ['context7'],
          islamicValidations: []
        }
      ],
      defaultPersonas: ['architect', 'backend'],
      mcpServers: ['context7'],
      estimatedDuration: { optimistic: 8, realistic: 16, pessimistic: 24 },
      prerequisites: ['Turborepo setup', 'Existing package structure'],
      deliverables: ['New package structure', 'Build configuration', 'Documentation'],
      qualityGates: ['Build system integration', 'TypeScript compilation'],
      riskFactors: ['Dependency conflicts', 'Build system complexity']
    };
  }

  static getAPIIntegrationTemplate(): WorkflowTemplate {
    return {
      id: 'api-integration',
      name: 'API Integration & Development',
      description: 'Complete API integration workflow for external services or new endpoints',
      applicableFor: ['api integration', 'external service', 'rest api', 'graphql'],
      islamicConsiderations: [],
      phases: [
        {
          name: 'API Planning & Design',
          description: 'Plan API integration approach and design interfaces',
          taskTemplates: [
            {
              title: 'Analyze API requirements and design interfaces',
              description: 'Study API documentation and design TypeScript interfaces',
              complexity: 0.5,
              duration: { optimistic: 2, realistic: 4, pessimistic: 6 },
              persona: 'backend',
              mcpServers: ['context7', 'sequential'],
              tools: ['Read', 'Write'],
              acceptanceCriteria: [
                'API documentation reviewed and understood',
                'TypeScript interfaces defined',
                'Authentication strategy planned',
                'Error handling approach designed'
              ],
              islamicRequirements: [],
              commands: [
                '/sc:implement api-interfaces --persona-backend --c7',
                'Design error handling strategy',
                'Plan authentication integration'
              ]
            }
          ],
          duration: { optimistic: 4, realistic: 8, pessimistic: 12 },
          dependencies: [],
          personas: ['backend'],
          mcpServers: ['context7', 'sequential'],
          islamicValidations: []
        }
      ],
      defaultPersonas: ['backend'],
      mcpServers: ['context7', 'sequential'],
      estimatedDuration: { optimistic: 12, realistic: 24, pessimistic: 36 },
      prerequisites: ['HTTP client setup', 'Environment configuration'],
      deliverables: ['API client', 'Type definitions', 'Error handling', 'Documentation'],
      qualityGates: ['API testing', 'Error handling validation', 'Performance testing'],
      riskFactors: ['External service reliability', 'API changes', 'Rate limiting']
    };
  }
}

// ========================================================================================
// TEMPLATE SELECTOR & APPLICATOR
// ========================================================================================

export class WorkflowTemplateEngine {
  private templates: Map<string, WorkflowTemplate> = new Map();

  constructor() {
    this.loadTemplates();
  }

  private loadTemplates(): void {
    // Load Islamic feature templates
    const prayerTimeTemplate = IslamicFeatureTemplates.getPrayerTimeTemplate();
    const arabicTextTemplate = IslamicFeatureTemplates.getArabicTextTemplate();
    const islamicContentTemplate = IslamicFeatureTemplates.getIslamicContentTemplate();

    // Load technical templates
    const monorepoTemplate = TechnicalTemplates.getMonorepoPackageTemplate();
    const apiTemplate = TechnicalTemplates.getAPIIntegrationTemplate();

    // Register templates
    this.templates.set(prayerTimeTemplate.id, prayerTimeTemplate);
    this.templates.set(arabicTextTemplate.id, arabicTextTemplate);
    this.templates.set(islamicContentTemplate.id, islamicContentTemplate);
    this.templates.set(monorepoTemplate.id, monorepoTemplate);
    this.templates.set(apiTemplate.id, apiTemplate);
  }

  selectApplicableTemplates(requirements: AnalyzedRequirement[]): WorkflowTemplate[] {
    const applicableTemplates: WorkflowTemplate[] = [];
    const requirementTexts = requirements.map(req => req.originalText.toLowerCase());
    const allText = requirementTexts.join(' ');

    for (const template of this.templates.values()) {
      const isApplicable = template.applicableFor.some(keyword => 
        allText.includes(keyword.toLowerCase())
      );

      if (isApplicable) {
        applicableTemplates.push(template);
      }
    }

    return applicableTemplates;
  }

  generatePhaseFromTemplate(
    template: WorkflowTemplate, 
    requirements: AnalyzedRequirement[]
  ): WorkflowPhase[] {
    return template.phases.map(phaseTemplate => {
      const tasks: WorkflowTask[] = phaseTemplate.taskTemplates.map((taskTemplate, index) => ({
        id: `${template.id}-task-${index}`,
        title: taskTemplate.title,
        description: taskTemplate.description,
        priority: 'medium' as const,
        complexity: taskTemplate.complexity,
        duration: taskTemplate.duration,
        dependencies: [],
        persona: taskTemplate.persona,
        mcpServers: taskTemplate.mcpServers,
        tools: taskTemplate.tools,
        acceptanceCriteria: taskTemplate.acceptanceCriteria,
        islamicRequirements: taskTemplate.islamicRequirements
      }));

      return {
        name: phaseTemplate.name,
        description: phaseTemplate.description,
        requirements: requirements
          .filter(req => this.isRequirementRelevantToTemplate(req, template))
          .map(req => req.id),
        tasks,
        duration: phaseTemplate.duration,
        dependencies: phaseTemplate.dependencies,
        personas: phaseTemplate.personas,
        mcpServers: phaseTemplate.mcpServers,
        deliverables: template.deliverables,
        qualityGates: template.qualityGates,
        islamicConsiderations: phaseTemplate.islamicValidations
      };
    });
  }

  private isRequirementRelevantToTemplate(
    requirement: AnalyzedRequirement, 
    template: WorkflowTemplate
  ): boolean {
    const reqText = requirement.originalText.toLowerCase();
    return template.applicableFor.some(keyword => 
      reqText.includes(keyword.toLowerCase())
    );
  }

  getTemplate(templateId: string): WorkflowTemplate | undefined {
    return this.templates.get(templateId);
  }

  listAvailableTemplates(): { id: string; name: string; description: string }[] {
    return Array.from(this.templates.values()).map(template => ({
      id: template.id,
      name: template.name,
      description: template.description
    }));
  }

  getTemplateRecommendations(requirements: AnalyzedRequirement[]): {
    template: WorkflowTemplate;
    relevanceScore: number;
    matchedKeywords: string[];
  }[] {
    const recommendations: {
      template: WorkflowTemplate;
      relevanceScore: number;
      matchedKeywords: string[];
    }[] = [];

    const allText = requirements.map(req => req.originalText.toLowerCase()).join(' ');

    for (const template of this.templates.values()) {
      const matchedKeywords: string[] = [];
      let relevanceScore = 0;

      template.applicableFor.forEach(keyword => {
        if (allText.includes(keyword.toLowerCase())) {
          matchedKeywords.push(keyword);
          relevanceScore += 1;
        }
      });

      // Boost score for Islamic features if Islamic requirements detected
      if (requirements.some(req => req.type === 'islamic') && 
          template.islamicConsiderations.length > 0) {
        relevanceScore += 2;
      }

      if (relevanceScore > 0) {
        recommendations.push({
          template,
          relevanceScore,
          matchedKeywords
        });
      }
    }

    return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}

// ========================================================================================
// INTEGRATION WITH MAIN WORKFLOW ENGINE
// ========================================================================================

export function integrateTemplatesWithWorkflow(
  requirements: AnalyzedRequirement[],
  templateEngine: WorkflowTemplateEngine
): {
  recommendedTemplates: WorkflowTemplate[];
  enhancedPhases: WorkflowPhase[];
  templateCommands: string[];
} {
  console.log('🎨 Integrating workflow templates...');

  // Get template recommendations
  const recommendations = templateEngine.getTemplateRecommendations(requirements);
  const recommendedTemplates = recommendations
    .filter(rec => rec.relevanceScore >= 2)
    .map(rec => rec.template);

  console.log(`📋 Found ${recommendedTemplates.length} relevant templates`);

  // Generate enhanced phases from templates
  const enhancedPhases: WorkflowPhase[] = [];
  const templateCommands: string[] = [];

  recommendedTemplates.forEach(template => {
    const templatePhases = templateEngine.generatePhaseFromTemplate(template, requirements);
    enhancedPhases.push(...templatePhases);

    // Extract commands from template tasks
    template.phases.forEach(phase => {
      phase.taskTemplates.forEach(task => {
        templateCommands.push(...task.commands);
      });
    });
  });

  return {
    recommendedTemplates,
    enhancedPhases,
    templateCommands
  };
}

// Export for use in main workflow engine
export { WorkflowTemplate, TemplatePhase, TaskTemplate };