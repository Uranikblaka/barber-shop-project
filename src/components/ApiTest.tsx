import { useState } from 'react';
import { apiClient } from '../lib/api';
import { apiTester, type ApiTestResult } from '../lib/apiTest';
import { testBackendServices } from '../lib/backendTest';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

export function ApiTest() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [testResults, setTestResults] = useState<ApiTestResult[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [backendTest, setBackendTest] = useState<any>(null);

  const testApiConnection = async () => {
    setStatus('loading');
    setMessage('Testing API connection...');
    setTestResults([]);
    setSummary(null);
    setBackendTest(null);
    
    try {
      // First test your specific backend endpoint
      const backendResult = await testBackendServices();
      setBackendTest(backendResult);
      
      if (!backendResult.success) {
        setStatus('error');
        setMessage(`❌ Backend connection failed: ${backendResult.error}`);
        return;
      }
      
      // Then run comprehensive tests
      const results = await apiTester.runAllTests();
      const summaryData = apiTester.getSummary();
      
      setTestResults(results);
      setSummary(summaryData);
      
      if (summaryData.failed === 0) {
        setStatus('success');
        setMessage(`✅ All API tests passed! (${summaryData.successful}/${summaryData.total} endpoints working)`);
      } else {
        setStatus('error');
        setMessage(`⚠️ Some API tests failed (${summaryData.successful}/${summaryData.total} endpoints working)`);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ API testing failed: ${error.message}`);
      setTestResults([]);
      setSummary(null);
      setBackendTest(null);
      console.error('API Test Error:', error);
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">API Connection Test</h3>
      
      <div className="flex gap-2 mb-4">
        <Button 
          onClick={testApiConnection}
          disabled={status === 'loading'}
          className="flex-1"
        >
          {status === 'loading' ? 'Testing...' : 'Run Comprehensive API Tests'}
        </Button>
        <Button 
          onClick={async () => {
            setStatus('loading');
            setMessage('Testing your specific backend...');
            const result = await testBackendServices();
            setBackendTest(result);
            setStatus(result.success ? 'success' : 'error');
            setMessage(result.success ? 
              `✅ Backend connected! Found ${result.count} services.` : 
              `❌ Backend failed: ${result.error}`
            );
          }}
          disabled={status === 'loading'}
          variant="outline"
          className="px-4"
        >
          Quick Test
        </Button>
      </div>
      
      {message && (
        <div className={`p-3 rounded-md mb-4 ${
          status === 'success' ? 'bg-green-100 text-green-800' :
          status === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {message}
        </div>
      )}
      
      {backendTest && (
        <div className={`p-4 rounded-lg mb-4 ${
          backendTest.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <h4 className="font-semibold mb-2 flex items-center">
            {backendTest.success ? '✅' : '❌'} Backend Services Test
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                backendTest.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {backendTest.success ? 'Connected' : 'Failed'}
              </span>
            </div>
            <div>
              <span className="font-medium">Data Type:</span> 
              <span className="ml-2 text-gray-600">{backendTest.type}</span>
            </div>
            <div>
              <span className="font-medium">Records Found:</span> 
              <span className="ml-2 text-gray-600">{backendTest.count}</span>
            </div>
            <div>
              <span className="font-medium">Response:</span> 
              <span className="ml-2 text-gray-600">
                {backendTest.success ? 'Valid JSON' : backendTest.error}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
            <div className="text-sm text-blue-800">Total Tests</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{summary.successful}</div>
            <div className="text-sm text-green-800">Successful</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
            <div className="text-sm text-red-800">Failed</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{summary.averageDuration}ms</div>
            <div className="text-sm text-yellow-800">Avg Duration</div>
          </div>
        </div>
      )}
      
      {testResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium mb-3">Test Results:</h4>
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Badge 
                  variant={result.status === 'success' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {result.status}
                </Badge>
                <span className="font-medium">{result.endpoint}</span>
                <span className="text-sm text-gray-500">({result.duration}ms)</span>
              </div>
              <div className="text-sm text-gray-600">
                {result.status === 'success' ? '✅' : '❌'}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {testResults.length > 0 && testResults.some(r => r.data) && (
        <div className="mt-6">
          <h4 className="font-medium mb-2">Sample Data from Services:</h4>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
            {JSON.stringify(
              testResults.find(r => r.endpoint === '/services')?.data?.slice(0, 2) || 'No data',
              null,
              2
            )}
          </pre>
        </div>
      )}
    </Card>
  );
}
