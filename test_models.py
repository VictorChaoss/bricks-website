import urllib.request, json
req = urllib.request.Request('https://openrouter.ai/api/v1/models')
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())
    for model in data['data']:
        if 'image' in model['id'].lower() or 'flux' in model['id'].lower() or 'imagen' in model['id'].lower() or 'diffusion' in model['id'].lower():
            print(model['id'])
