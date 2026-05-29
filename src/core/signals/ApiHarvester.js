import fetch from 'node-fetch';

/**
 * Analyzes a JSON object to infer primitive types.
 */
function inferTypes(obj) {
  if (obj === null) return 'any';
  if (Array.isArray(obj)) {
    if (obj.length > 0) return `${inferTypes(obj[0])}[]`;
    return 'any[]';
  }
  if (typeof obj === 'object') {
    const fields = Object.entries(obj).map(([k, v]) => `  ${k}: ${inferTypes(v)};`).join('\n');
    return `{\n${fields}\n}`;
  }
  return typeof obj;
}

export class ApiHarvester {
  
  /**
   * Harvests a URL, analyzes its JSON response, and generates a React Hook / API Client.
   */
  async harvest(url, name = 'useHarvestedApi') {
    console.log(`[ApiHarvester] Harvesting URL: ${url}`);
    
    let data;
    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      data = await response.json();
    } catch (e) {
      throw new Error(`Failed to fetch and parse JSON from URL: ${e.message}`);
    }

    // Attempt to infer structure
    const sample = Array.isArray(data) ? data[0] : data;
    const typeDef = inferTypes(sample);

    // Generate Code
    const generatedCode = `
import { useState, useEffect } from 'react';

/**
 * 🚀 AUTONOMOUS API HARVESTER
 * Generated from: ${url}
 *
 * Inferred Schema:
 * ${typeDef.split('\\n').join('\\n * ')}
 */

export function ${name}() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('${url}', {
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const result = await response.json();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setData(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => { mounted = false; };
  }, []);

  return { data, loading, error };
}
    `.trim();

    return {
      url,
      schema: typeDef,
      code: generatedCode,
      rawSample: sample
    };
  }
}
