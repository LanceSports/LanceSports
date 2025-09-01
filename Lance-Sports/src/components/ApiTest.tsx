import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { api } from '../lib/api';

export function ApiTest() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testEndpoint = async (endpoint: string, testFn: () => Promise<any>) => {
    setLoading(endpoint);
    setError(null);
    try {
      const result = await testFn();
      setResults(prev => ({ ...prev, [endpoint]: result }));
    } catch (err: any) {
      setError(`${endpoint}: ${err.message}`);
      console.error(`Error testing ${endpoint}:`, err);
    } finally {
      setLoading(null);
    }
  };

  const testHealth = () => testEndpoint('health', api.health);
  const testProfile = () => testEndpoint('profile', api.getUserProfile);
  const testMatches = () => testEndpoint('matches', api.getUserMatches);
  const testSports = () => testEndpoint('sports', api.getPublicSports);
  const testCreateMatch = () => testEndpoint('createMatch', () => 
    api.createMatch({
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      sport: 'Football'
    })
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">API Test Dashboard</h1>
        <p className="text-gray-600">Test the authentication flow and API endpoints</p>
      </div>

      {/* Test Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Test Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button
              onClick={testHealth}
              disabled={loading === 'health'}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              {loading === 'health' ? 'Testing...' : 'Health Check'}
            </Button>

            <Button
              onClick={testProfile}
              disabled={loading === 'profile'}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              {loading === 'profile' ? 'Testing...' : 'User Profile'}
            </Button>

            <Button
              onClick={testMatches}
              disabled={loading === 'matches'}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              {loading === 'matches' ? 'Testing...' : 'User Matches'}
            </Button>

            <Button
              onClick={testSports}
              disabled={loading === 'sports'}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              {loading === 'sports' ? 'Testing...' : 'Public Sports'}
            </Button>

            <Button
              onClick={testCreateMatch}
              disabled={loading === 'createMatch'}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              {loading === 'createMatch' ? 'Testing...' : 'Create Match'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {Object.keys(results).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>API Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(results).map(([endpoint, result]) => (
                <div key={endpoint} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 capitalize">
                    {endpoint.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">How to Test</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Health Check:</strong> Should work without authentication</li>
            <li><strong>User Profile:</strong> Requires valid JWT token (sign in first)</li>
            <li><strong>User Matches:</strong> Requires valid JWT token (sign in first)</li>
            <li><strong>Public Sports:</strong> Works with or without authentication</li>
            <li><strong>Create Match:</strong> Requires valid JWT token (sign in first)</li>
          </ol>
          <div className="mt-4 p-3 bg-blue-100 rounded">
            <strong>Note:</strong> Make sure you're signed in with Google OAuth before testing protected endpoints. 
            The JWT token is automatically included in authenticated requests.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
