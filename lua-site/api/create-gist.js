export default async function handler(req, res) {
  if(req.method !== 'POST') 
    return res.status(405).json({error:'Method not allowed'});

  const { code, filename } = req.body;
  if(!code || !filename) 
    return res.status(400).json({error:'Missing code or filename'});

  const token = process.env.GITHUB_TOKEN; // din token sparas i Vercel, inte här i klienten
  const gistData = { public: true, files: { [filename]: { content: code } } };

  const r = await fetch('https://api.github.com/gists', {
    method:'POST',
    headers:{ 
      'Authorization': `token ${token}`, 
      'Content-Type':'application/json' 
    },
    body: JSON.stringify(gistData)
  });

  const data = await r.json();

  if(r.ok){
    const rawFile = Object.values(data.files)[0].raw_url;
    // Wrap the raw URL in loadstring(game:HttpGet("..."))()
    const wrappedCode = `loadstring(game:HttpGet("${rawFile}"))()`;
    res.status(200).json({ raw: wrappedCode });
  } else {
    res.status(500).json({error:data});
  }
}
