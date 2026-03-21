
export interface SheetData {
  notifications: any[];
  gallery: any[];
  studyMaterials: any[];
  toppers: any[];
  users: any[];
  tests: any[];
  testQuestions: any[];
  testResults: any[];
  noticeBoard: any[];
  prePrimaryContent: any[];
  kahanis: any[];
  appSettings: any[];
  teachers: any[];
  socialLinks: any[];
}

class GoogleSheetsService {
  private sheetId: string = '';
  private scriptUrl: string = '';

  setSheetId(id: string) {
    this.sheetId = id;
  }

  setScriptUrl(url: string) {
    this.scriptUrl = url;
  }

  async fetchSheetData(tabName: string, config?: { sheetId?: string, scriptUrl?: string }): Promise<any[]> {
    const currentSheetId = config?.sheetId || this.sheetId;
    const currentScriptUrl = config?.scriptUrl || this.scriptUrl;
    const cacheKey = `cache_${tabName}_${currentSheetId}`;

    if (!currentSheetId) {
      console.warn('Google Sheets ID not set.');
      return [];
    }

    const getCachedData = () => {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          console.error(`Failed to parse cache for ${tabName}`);
        }
      }
      return null;
    };

    const setCachedData = (data: any[]) => {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (e) {
        console.warn(`Failed to save cache for ${tabName} (likely quota exceeded)`);
      }
    };

    // Try using the Apps Script if available (supports private sheets)
    if (currentScriptUrl && window.navigator.onLine) {
      try {
        const payload = {
          action: 'read',
          tabName,
          sheetId: currentSheetId
        };

        const response = await fetch(currentScriptUrl, {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (result.status === 'success' && Array.isArray(result.data)) {
          setCachedData(result.data);
          return result.data;
        }
      } catch (error) {
        console.warn(`Apps Script fetch failed for ${tabName}, falling back to public visualization API:`, error);
      }
    }

    // Fallback to visualization API (requires sheet to be public)
    if (window.navigator.onLine) {
      try {
        const url = `https://docs.google.com/spreadsheets/d/${currentSheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}&t=${Date.now()}`;
        const response = await fetch(url);
        
        if (response.ok) {
          const text = await response.text();
          const startIdx = text.indexOf('{');
          const endIdx = text.lastIndexOf('}');
          
          if (startIdx !== -1 && endIdx !== -1) {
            const jsonStr = text.substring(startIdx, endIdx + 1);
            const data = JSON.parse(jsonStr);
            
            if (data.status !== 'error') {
              const rows = data.table.rows;
              let cols = data.table.cols.map((col: any) => col.label || '');
              let dataRows = rows;
              
              if (cols.every(label => !label || /^[A-Z]+$/.test(label)) && rows.length > 0) {
                const firstRow = rows[0];
                if (firstRow.c) {
                  cols = firstRow.c.map((cell: any) => (cell && cell.v ? String(cell.v) : ''));
                  dataRows = rows.slice(1);
                }
              }

              const result = dataRows.map((row: any, rowIndex: number) => {
                const actualRowIndex = dataRows === rows ? rowIndex + 2 : rowIndex + 3;
                const obj: any = { _rowIndex: actualRowIndex };
                if (row.c) {
                  row.c.forEach((cell: any, i: number) => {
                    if (cols[i]) {
                      const key = cols[i].toLowerCase().replace(/\s+/g, '');
                      obj[key] = cell ? (cell.f || cell.v) : null;
                    }
                  });
                }
                return obj;
              });

              setCachedData(result);
              return result;
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching sheet data for ${tabName}:`, error);
      }
    }

    // If we reach here, either we are offline or network fetch failed
    const cached = getCachedData();
    if (cached) {
      console.log(`Using cached data for ${tabName} (Offline Mode)`);
      return cached;
    }

    return [];
  }

  async runSetup(config?: { sheetId?: string, scriptUrl?: string }): Promise<{ success: boolean; message: string }> {
    const currentSheetId = config?.sheetId || this.sheetId;
    const currentScriptUrl = config?.scriptUrl || this.scriptUrl;

    if (!currentScriptUrl) {
      return { success: false, message: 'Google Apps Script URL is not set.' };
    }

    try {
      const payload = {
        action: 'setup',
        sheetId: currentSheetId
      };

      const response = await fetch(currentScriptUrl, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      return { 
        success: result.status === 'success', 
        message: result.message || 'Setup completed.'
      };
    } catch (error: any) {
      console.error(`Error running setup:`, error);
      return { success: false, message: 'Failed to run setup. Check your Script URL.' };
    }
  }

  async writeToSheet(action: 'add' | 'update' | 'delete', tabName: string, data: any, config?: { sheetId?: string, scriptUrl?: string }): Promise<{ success: boolean; message: string }> {
    const currentSheetId = config?.sheetId || this.sheetId;
    const currentScriptUrl = config?.scriptUrl || this.scriptUrl;

    if (!currentScriptUrl) {
      return { success: false, message: 'Google Apps Script URL is not set.' };
    }

    try {
      const payload = {
        action,
        tabName,
        data: {
          ...data,
          createdat: data.createdat || new Date().toISOString()
        },
        sheetId: currentSheetId
      };

      // Using text/plain to avoid complex CORS preflight if possible, 
      // though Apps Script handles JSON fine when deployed correctly.
      const response = await fetch(currentScriptUrl, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();
      return { 
        success: result.status === 'success', 
        message: result.message || (result.status === 'success' ? `Data ${action === 'add' ? 'added' : action + 'd'} successfully.` : 'Failed to write to Google Sheets.')
      };
    } catch (error: any) {
      console.error(`Error writing to sheet:`, error);
      return { success: false, message: 'Network error: Please ensure your Apps Script is deployed as "Web App" and access is set to "Anyone".' };
    }
  }

  async login(username: string, password: string, config?: { sheetId?: string, scriptUrl?: string }): Promise<{ success: boolean; user?: any; message?: string }> {
    const currentSheetId = config?.sheetId || this.sheetId;
    const currentScriptUrl = config?.scriptUrl || this.scriptUrl;

    if (!currentScriptUrl) {
      return { success: false, message: 'Google Apps Script URL is not set.' };
    }

    try {
      const payload = {
        action: 'login',
        username,
        password,
        sheetId: currentSheetId
      };

      const response = await fetch(currentScriptUrl, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        return { success: true, user: result.user };
      } else {
        return { success: false, message: result.message || 'Invalid username or password.' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error: Failed to connect to Google Sheets. Check your Script URL and Deployment settings.' };
    }
  }

  async testConnection(config?: { sheetId?: string, scriptUrl?: string }): Promise<{ success: boolean; message: string }> {
    const currentSheetId = config?.sheetId || this.sheetId;
    
    if (!currentSheetId) return { success: false, message: 'Sheet ID is missing.' };
    
    try {
      let data = await this.fetchSheetData('Notifications', config);
      if (data.length >= 0) {
        return { success: true, message: `Connected successfully!` };
      }
    } catch (err: any) {
      try {
        let data = await this.fetchSheetData('Tests', config);
        if (data.length >= 0) {
          return { success: true, message: `Connected successfully to Test Series!` };
        }
      } catch (err2: any) {
        return { success: false, message: err2.message || 'Connection failed.' };
      }
      return { success: false, message: err.message || 'Connection failed.' };
    }
    return { success: false, message: 'Connection failed.' };
  }

  async getTestData(config?: { sheetId?: string, scriptUrl?: string }): Promise<Partial<SheetData>> {
    const safeFetch = async (tabName: string) => {
      try {
        return await this.fetchSheetData(tabName, config);
      } catch (error) {
        console.warn(`Skipping tab ${tabName} due to error:`, error);
        return [];
      }
    };

    let tests = await safeFetch('Tests');
    if (!tests || tests.length === 0) {
      tests = await safeFetch('Test');
    }

    let testQuestions = await safeFetch('TestQuestions');
    if (!testQuestions || testQuestions.length === 0) {
      testQuestions = await safeFetch('TestQuestion');
    }

    let testResults = await safeFetch('TestResults');
    if (!testResults || testResults.length === 0) {
      testResults = await safeFetch('TestResult');
    }

    return {
      tests,
      testQuestions,
      testResults
    };
  }

  async getAllData(config?: { sheetId?: string, scriptUrl?: string }): Promise<SheetData> {
    const safeFetch = async (tabName: string) => {
      try {
        return await this.fetchSheetData(tabName, config);
      } catch (error) {
        console.warn(`Skipping tab ${tabName} due to error:`, error);
        return [];
      }
    };

    const [notifications, gallery, studyMaterials, toppers, users, noticeBoard, prePrimaryContent, kahanis, appSettings, teachers, socialLinks] = await Promise.all([
      safeFetch('Notifications'),
      safeFetch('Gallery'),
      safeFetch('StudyMaterials'),
      safeFetch('Toppers'),
      safeFetch('Users'),
      safeFetch('NoticeBoard'),
      safeFetch('PrePrimaryContent'),
      safeFetch('Kahanis'),
      safeFetch('AppBasicSettings'),
      safeFetch('Teachers'),
      safeFetch('SocialLinks')
    ]);

    let tests = await safeFetch('Tests');
    if (!tests || tests.length === 0) {
      tests = await safeFetch('Test');
    }

    let testQuestions = await safeFetch('TestQuestions');
    if (!testQuestions || testQuestions.length === 0) {
      testQuestions = await safeFetch('TestQuestion');
    }

    let testResults = await safeFetch('TestResults');
    if (!testResults || testResults.length === 0) {
      testResults = await safeFetch('TestResult');
    }

    return {
      notifications,
      gallery,
      studyMaterials,
      toppers,
      users,
      tests,
      testQuestions,
      testResults,
      noticeBoard,
      prePrimaryContent,
      kahanis,
      appSettings,
      teachers,
      socialLinks
    };
  }

  getSetting(settings: any[], key: string, defaultValue: string = ''): string {
    if (!settings || !Array.isArray(settings)) return defaultValue;
    const setting = settings.find(s => s.key === key || s.settingkey === key);
    return setting ? (setting.value || setting.settingvalue || defaultValue) : defaultValue;
  }
}

export const googleSheetsService = new GoogleSheetsService();
