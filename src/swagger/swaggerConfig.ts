import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Client Manager API',
      version: '1.0.0',
      description: 'A comprehensive REST API for managing clients and suppliers with user authentication',
      contact: {
        name: 'API Support',
        email: 'support@clientmanager.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'authenticated'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            }
          }
        },
        Client: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Client ID'
            },
            user_id: {
              type: 'string',
              description: 'Owner user ID'
            },
            name: {
              type: 'string',
              description: 'Client name'
            },
            phone: {
              type: 'string',
              description: 'Client phone number'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Client email'
            },
            amount_owed: {
              type: 'number',
              description: 'Amount owed by client'
            },
            notes: {
              type: 'string',
              description: 'Additional notes'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Supplier: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Supplier ID'
            },
            user_id: {
              type: 'string',
              description: 'Owner user ID'
            },
            name: {
              type: 'string',
              description: 'Supplier name'
            },
            phone: {
              type: 'string',
              description: 'Supplier phone number'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Supplier email'
            },
            amount_owed: {
              type: 'number',
              description: 'Amount owed to supplier'
            },
            notes: {
              type: 'string',
              description: 'Additional notes'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        DashboardStats: {
          type: 'object',
          properties: {
            total_money_owed_to_me: {
              type: 'number',
              description: 'Total amount owed by clients'
            },
            total_money_i_owe: {
              type: 'number',
              description: 'Total amount owed to suppliers'
            },
            net_position: {
              type: 'number',
              description: 'Net financial position'
            },
            total_clients: {
              type: 'integer',
              description: 'Total number of clients'
            },
            total_suppliers: {
              type: 'integer',
              description: 'Total number of suppliers'
            },
            recent_clients: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Client'
              }
            },
            recent_suppliers: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Supplier'
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    }
  },
  apis: ['./src/controllers/*.ts'] // Path to the API files
};

export const specs = swaggerJsdoc(options);