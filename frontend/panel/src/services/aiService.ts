// AI Service for SQL Generation and Assistance
export interface AIRequest {
  prompt: string;
  context?: {
    tableSchema?: any[];
    currentQuery?: string;
    databaseType?: string;
  };
}

export interface AIResponse {
  sql: string;
  explanation: string;
  suggestions: string[];
  confidence: number;
}

export interface SQLDiff {
  original: string;
  modified: string;
  changes: {
    type: 'added' | 'removed' | 'modified';
    line: number;
    content: string;
  }[];
}

export interface Snippet {
  id: string;
  name: string;
  description: string;
  sql: string;
  tags: string[];
  category: string;
  created_at: string;
  usage_count: number;
}

// Vite env tipi için
declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

class AIService {
  private apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  private baseUrl = 'https://api.openai.com/v1';

  private async request<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  // Generate SQL from natural language
  async generateSQL(request: AIRequest): Promise<AIResponse> {
    const prompt = `
      You are a SQL expert. Generate SQL based on the following request:
      
      Request: ${request.prompt}
      
      ${request.context?.tableSchema ? `Table Schema: ${JSON.stringify(request.context.tableSchema)}` : ''}
      ${request.context?.databaseType ? `Database: ${request.context.databaseType}` : 'Use PostgreSQL syntax'}
      
      Provide:
      1. The SQL query
      2. Explanation of what the query does
      3. Suggestions for optimization
      4. Confidence level (0-1)
    `;

    try {
      const response = await this.request<{ choices: { message: { content: string } }[] }>('chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a SQL expert. Always respond with valid SQL and clear explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      });

      // Parse the response and extract SQL
      const content = response.choices[0].message.content;
      const sqlMatch = content.match(/```sql\n([\s\S]*?)\n```/);
      const sql = sqlMatch ? sqlMatch[1] : content;

      return {
        sql,
        explanation: content,
        suggestions: [],
        confidence: 0.8,
      };
    } catch (error) {
      // Fallback to mock response
      return this.getMockResponse(request.prompt);
    }
  }

  // Generate SQL diff
  async generateDiff(originalSQL: string, modifiedSQL: string): Promise<SQLDiff> {
    const prompt = `
      Compare these two SQL queries and show the differences:
      
      Original:
      ${originalSQL}
      
      Modified:
      ${modifiedSQL}
      
      Show the differences in a structured format.
    `;

    try {
      const response = await this.request<{ choices: { message: { content: string } }[] }>('chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a SQL diff expert. Analyze differences between SQL queries.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.1,
      });

      return this.parseDiffResponse(response.choices[0].message.content, originalSQL, modifiedSQL);
    } catch (error) {
      return this.getMockDiff(originalSQL, modifiedSQL);
    }
  }

  // Get SQL suggestions
  async getSuggestions(currentQuery: string, context?: any): Promise<string[]> {
    const prompt = `
      Based on this SQL query, suggest improvements or alternatives:
      
      Query: ${currentQuery}
      ${context ? `Context: ${JSON.stringify(context)}` : ''}
      
      Provide 3-5 suggestions for improvement.
    `;

    try {
      const response = await this.request<{ choices: { message: { content: string } }[] }>('chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a SQL optimization expert. Provide practical suggestions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
      });

      const content = response.choices[0].message.content;
      return content.split('\n').filter((line: string) => line.trim().length > 0).slice(0, 5);
    } catch (error) {
      return [
        'Consider adding indexes for better performance',
        'Use EXPLAIN ANALYZE to check query execution plan',
        'Consider using CTEs for complex queries',
        'Add appropriate WHERE clauses to limit data',
        'Use appropriate data types for columns'
      ];
    }
  }

  // Share snippet
  async shareSnippet(snippet: Omit<Snippet, 'id' | 'created_at' | 'usage_count'>): Promise<Snippet> {
    const newSnippet: Snippet = {
      ...snippet,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      usage_count: 0,
    };

    // In a real app, this would save to a database
    return newSnippet;
  }

  // Get popular snippets
  async getPopularSnippets(category?: string): Promise<Snippet[]> {
    const mockSnippets: Snippet[] = [
      {
        id: '1',
        name: 'User Analytics Query',
        description: 'Get user activity statistics with joins',
        sql: `
          SELECT 
            u.id,
            u.name,
            COUNT(o.id) as order_count,
            SUM(o.total) as total_spent
          FROM users u
          LEFT JOIN orders o ON u.id = o.user_id
          WHERE u.created_at >= NOW() - INTERVAL '30 days'
          GROUP BY u.id, u.name
          ORDER BY total_spent DESC
        `,
        tags: ['analytics', 'users', 'orders'],
        category: 'analytics',
        created_at: '2024-01-15T10:30:00Z',
        usage_count: 45,
      },
      {
        id: '2',
        name: 'Product Performance',
        description: 'Analyze product sales performance',
        sql: `
          SELECT 
            p.name,
            p.category,
            COUNT(oi.id) as units_sold,
            SUM(oi.price * oi.quantity) as revenue
          FROM products p
          LEFT JOIN order_items oi ON p.id = oi.product_id
          LEFT JOIN orders o ON oi.order_id = o.id
          WHERE o.created_at >= NOW() - INTERVAL '90 days'
          GROUP BY p.id, p.name, p.category
          HAVING units_sold > 0
          ORDER BY revenue DESC
        `,
        tags: ['products', 'sales', 'revenue'],
        category: 'sales',
        created_at: '2024-01-14T15:45:00Z',
        usage_count: 32,
      },
      {
        id: '3',
        name: 'Database Health Check',
        description: 'Check database performance and health',
        sql: `
          SELECT 
            schemaname,
            tablename,
            attname,
            n_distinct,
            correlation
          FROM pg_stats
          WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
          ORDER BY n_distinct DESC
        `,
        tags: ['performance', 'health', 'postgresql'],
        category: 'maintenance',
        created_at: '2024-01-13T09:20:00Z',
        usage_count: 28,
      },
    ];

    if (category) {
      return mockSnippets.filter(s => s.category === category);
    }

    return mockSnippets;
  }

  // Mock response for fallback
  private getMockResponse(prompt: string): AIResponse {
    const mockResponses: { [key: string]: AIResponse } = {
      'users': {
        sql: 'SELECT * FROM users ORDER BY created_at DESC LIMIT 10;',
        explanation: 'Retrieves the 10 most recently created users',
        suggestions: ['Add WHERE clause to filter specific users', 'Consider pagination for large datasets'],
        confidence: 0.9,
      },
      'orders': {
        sql: 'SELECT * FROM orders WHERE status = \'completed\' AND created_at >= NOW() - INTERVAL \'30 days\';',
        explanation: 'Gets completed orders from the last 30 days',
        suggestions: ['Add indexes on status and created_at columns', 'Consider using date ranges'],
        confidence: 0.8,
      },
      'analytics': {
        sql: `
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as count,
            SUM(total) as revenue
          FROM orders
          WHERE created_at >= NOW() - INTERVAL '7 days'
          GROUP BY DATE(created_at)
          ORDER BY date DESC;
        `,
        explanation: 'Daily order analytics for the last 7 days',
        suggestions: ['Add timezone consideration', 'Consider materialized views for performance'],
        confidence: 0.85,
      },
    };

    const key = Object.keys(mockResponses).find(k => prompt.toLowerCase().includes(k));
    return key ? mockResponses[key] : {
      sql: 'SELECT * FROM table_name LIMIT 10;',
      explanation: 'Basic query template - modify table_name and add conditions as needed',
      suggestions: ['Replace table_name with actual table', 'Add WHERE clauses for filtering'],
      confidence: 0.6,
    };
  }

  // Mock diff for fallback
  private getMockDiff(original: string, modified: string): SQLDiff {
    const lines = original.split('\n');
    const modifiedLines = modified.split('\n');
    
    const changes = [];
    const maxLines = Math.max(lines.length, modifiedLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const originalLine = lines[i] || '';
      const modifiedLine = modifiedLines[i] || '';
      
      if (originalLine !== modifiedLine) {
        if (originalLine && !modifiedLine) {
          changes.push({ type: 'removed' as const, line: i + 1, content: originalLine });
        } else if (!originalLine && modifiedLine) {
          changes.push({ type: 'added' as const, line: i + 1, content: modifiedLine });
        } else {
          changes.push({ type: 'modified' as const, line: i + 1, content: modifiedLine });
        }
      }
    }

    return {
      original,
      modified,
      changes,
    };
  }

  // Parse diff response
  private parseDiffResponse(content: string, original: string, modified: string): SQLDiff {
    // Simple parsing - in a real implementation, this would be more sophisticated
    return this.getMockDiff(original, modified);
  }
}

export const aiService = new AIService(); 