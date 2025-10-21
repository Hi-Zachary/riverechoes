function needsPOIRecommendation(question: string): boolean {
  const actionKeywords = [
    '推荐', '附近', '哪里有', '参观', '游览', '去哪', '博物馆', '景点',
    '地点', '地方', '场所', '位置', '去处', '可以去', '有没有', '在哪', 
    '怎么去', '如何前往', '观光', '旅游', '拜访', '游玩', '打卡', 
    '导览', '展览', '展示', '文物', '古迹'
  ];
  
  const themeKeywords = [
    '满族', '清朝', '文化', '历史', '八旗', '皇家', '皇族', '皇室',
    '皇宫', '紫禁城', '故宫', '清史', '满清', '满汉', '东北', '民族',
    '传统', '风俗', '习俗', '服饰', '宫廷', '建筑', '园林', '陵墓'
  ];
  
  return actionKeywords.some(keyword => question.includes(keyword)) && 
         themeKeywords.some(keyword => question.includes(keyword));
}

// 位置关键词检测函数
function needsLocationBasedSearch(question: string): boolean {
  const locationKeywords = ['附近', '周围', '周边', '身边', '就近', '旁边', '边上', '不远', '近处'];
  return locationKeywords.some(keyword => question.includes(keyword));
}

function extractLocation(question: string): { city: string, province: string } {
  const provinceMap = {
    '华北': ['北京市', '天津市', '河北省', '山西省', '内蒙古自治区'],
    '东北': ['辽宁省', '吉林省', '黑龙江省'],
    '华东': ['上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省'],
    '华中': ['河南省', '湖北省', '湖南省'],
    '华南': ['广东省', '广西壮族自治区', '海南省'],
    '西南': ['重庆市', '四川省', '贵州省', '云南省', '西藏自治区'],
    '西北': ['陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区']
  };
  
  const provinceCapitals = {
    '北京': '北京', '天津': '天津', '上海': '上海', '重庆': '重庆',
    '河北': '石家庄', '山西': '太原', '内蒙古': '呼和浩特',
    '辽宁': '沈阳', '吉林': '长春', '黑龙江': '哈尔滨',
    '江苏': '南京', '浙江': '杭州', '安徽': '合肥', '福建': '福州',
    '江西': '南昌', '山东': '济南', '河南': '郑州', '湖北': '武汉',
    '湖南': '长沙', '广东': '广州', '广西': '南宁', '海南': '海口',
    '四川': '成都', '贵州': '贵阳', '云南': '昆明', '西藏': '拉萨',
    '陕西': '西安', '甘肃': '兰州', '青海': '西宁', '宁夏': '银川',
    '新疆': '乌鲁木齐'
  };
  
  const cities = [
    '北京', '上海', '广州', '深圳', '成都', '重庆', '大连', '东莞',
    '佛山', '福州', '杭州', '合肥', '济南', '昆明', '南京', '宁波',
    '青岛', '苏州', '天津', '武汉', '西安', '厦门', '长沙', '郑州',
    '长春', '哈尔滨', '沈阳', '石家庄', '太原', '呼和浩特', '南昌', '南宁',
    '海口', '贵阳', '拉萨', '兰州', '西宁', '银川', '乌鲁木齐', '开封',
    '洛阳', '扬州', '绍兴', '泉州', '景德镇', '遵义', '丽江', '大理', '敦煌'
  ];

  const normalizedCities = [...new Set(cities)].map(c => c.replace('市', ''));
  
  let detectedCity = null;
  let detectedProvince = null;
  
  for (const city of normalizedCities) {
    if (question.includes(city)) {
      detectedCity = city;
      break;
    }
  }
  
  const provinceAliases = {
    '内蒙古': ['内蒙'],
    '黑龙江': ['黑龙'],
    '新疆': ['新疆维吾尔'],
    '宁夏': ['宁夏回族'],
    '广西': ['广西壮族']
  };
  
  for (const [region, provinceList] of Object.entries(provinceMap)) {
    for (const province of provinceList) {
      const shortProvince = province.replace(/省|市|自治区/g, '');
      
      let aliases = [province, shortProvince];
      for (const [key, values] of Object.entries(provinceAliases)) {
        if (key === shortProvince || values.includes(shortProvince)) {
          aliases = [...aliases, key, ...values];
          break;
        }
      }
      
      if (aliases.some(alias => question.includes(alias))) {
        detectedProvince = shortProvince;
        if (!detectedCity) {
          detectedCity = (provinceCapitals as any)[shortProvince] || '北京';
        }
        break;
      }
    }
    if (detectedProvince) break;
  }
  
  return {
    city: detectedCity || '北京',
    province: detectedProvince || '北京'
  };
}

function extractPOIKeywords(question: string): string {
  if (question.includes('满族博物馆')) return '满族博物馆';
  if (question.includes('满族') && question.includes('文化') && question.includes('博物馆')) 
    return '满族文化博物馆';
  if (question.includes('满族') && question.includes('历史') && question.includes('博物馆'))
    return '满族历史博物馆';
  if (question.includes('清朝') && question.includes('博物馆'))
    return '清朝博物馆';
  
  if (question.includes('满族')) {
    if (question.includes('博物馆')) return '满族博物馆';
    if (question.includes('文化')) return '满族文化';
    if (question.includes('历史')) return '满族历史';
    if (question.includes('服饰')) return '满族服饰';
    if (question.includes('美食')) return '满族美食';
    if (question.includes('商店') || question.includes('店铺')) return '满族文化商店';
    return '满族';
  }
  
  if (question.includes('清朝')) {
    if (question.includes('博物馆')) return '清朝博物馆';
    if (question.includes('历史')) return '清朝历史';
    if (question.includes('文化')) return '清朝文化';
    return '清朝';
  }
  
  if (question.includes('博物馆')) return '博物馆';
  return '满族博物馆';
}

function generateNonce(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function escapeSSEText(text: string): string {
  return text
    .replace(/\n/g, '\\n')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '\\r');
}

// 百度地图POI搜索函数
async function searchBaiduPOI(keywords: string, city: string, province?: string, coords?: { latitude: number, longitude: number }) {
  try {
    const baiduAK = 'm62j1oeJ9fqqk8A3eAwapduSlrG17T2q';
    
    let url = '';
    const baseUrl = 'https://api.map.baidu.com/place/v2/search';
    
    // 如果有坐标，使用圆形区域检索
    if (coords) {
      console.log("使用百度地图坐标搜索POI:", coords);
      // 百度地图API格式：lat,lng (纬度,经度)
      url = `${baseUrl}?query=${encodeURIComponent(keywords)}&location=${coords.latitude},${coords.longitude}&radius=5000&output=json&ak=${baiduAK}&page_size=10&page_num=0`;
    } else {
      // 否则使用城市区域搜索
      const searchArea = city || province || '北京';
      console.log("使用百度地图城市搜索POI:", searchArea);
      url = `${baseUrl}?query=${encodeURIComponent(keywords)}&region=${encodeURIComponent(searchArea)}&output=json&ak=${baiduAK}&page_size=10&page_num=0`;
    }
    
    console.log("百度地图POI API 请求:", url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`百度地图API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log("百度地图POI API 响应:", data);
    
    if (data.status !== 0) {
      throw new Error(`百度地图API错误: ${data.message}`);
    }
    
    if (!data.results || data.results.length === 0) {
      console.log('百度地图未找到相关POI结果');
      return [];
    }
    
    // 转换百度地图结果格式为项目统一格式
    return data.results.map((poi: any) => ({
      name: poi.name,
      address: poi.address || '地址未提供',
      phone: poi.telephone || '电话未提供',
      city: poi.city || city || '未知',
      district: poi.area || '',
      latitude: poi.location?.lat || 0,
      longitude: poi.location?.lng || 0,
      uid: poi.uid || ''
    }));
    
  } catch (error) {
    console.error('百度地图POI搜索错误:', error);
    return [];
  }
}

async function callZhipuAI(question: string, chatid: string) {
  const apiKey = process.env.ZHIPU_API_KEY;
  
  if (!apiKey) {
    throw new Error('缺少智谱AI API密钥');
  }
  
  const url = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  };

  // 构建消息数组，包含系统提示
  const messages = [
    {
      role: "system",
      content: "你是一个专业的满族文化导览助手，专门为用户介绍满族历史、文化、习俗和相关景点。请用友好、专业的语言回答用户的问题。"
    },
    {
      role: "user", 
      content: question
    }
  ];

  return await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "glm-4-flash",
      messages: messages,
      stream: true,
      temperature: 0.9,
      top_p: 0.7,
      max_tokens: 2048,
      user_id: chatid
    })
  });
}

function formatPOIRecommendations(pois: any) {
  return pois.map((poi: any, index: number) => 
    `${index + 1}. ${poi.name}\n   地址：${poi.address || '未提供'}\n   电话：${poi.phone || '未提供'}\n   所在区域：${poi.city}${poi.district}`
  ).join('\n\n');
}

// 修改generatePOIIntroduction，支持位置搜索情况
function generatePOIIntroduction(question: string, city: string, province?: string, isNearbySearch: boolean = false) {
  const area = isNearbySearch ? '您附近' : (city || province || '北京');
  
  if (question.includes('满族')) {
    return `为您找到${area}的以下与满族文化相关的地点：`;
  } else if (question.includes('清朝')) {
    return `以下是${area}的一些与清朝历史相关的推荐地点：`;
  } else if (question.includes('博物馆')) {
    return `为您推荐${area}的以下可以参观的博物馆：`;
  }
  return `根据您的需求，为您找到${area}的以下相关地点：`;
}

function processChunk(line: any, res: any) {
  line = line.trim();
  if (!line) return;

  if (line.startsWith('event:')) {
    res.write(`${line}\n`);
    return;
  }

  if (line.startsWith('data:')) {
    try {
      const content = line.substring(5).trim();

      if (content === '[DONE]') {
        res.write(`${line}\n\n`);
        return;
      }

      const data = JSON.parse(content);

      // 智谱AI响应格式处理
      if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
        const answer = data.choices[0].delta.content;
        res.write(`data: {"answer": ${JSON.stringify(answer)}}\n\n`);
      } else if (data.message !== undefined) {
        res.write(`data: {"answer": ${JSON.stringify(data.message)}}\n\n`);
      } else if (data.reply !== undefined) {
        res.write(`data: {"answer": ${JSON.stringify(data.reply)}}\n\n`);
      } else {
        // 忽略不符合格式的数据，不发送给前端
        console.log('忽略不符合格式的数据:', content);
      }
    } catch (e) {
      console.error('解析数据出错:', e, '原始行:', line);
      // 不发送解析错误的数据给前端
    }
    return;
  }

  res.write(`${line}\n`);
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.chatid || !body.question) {
    return createError({
      statusCode: 400,
      statusMessage: '缺少必要参数 chatid 或 question'
    });
  }
  
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  
  if (needsPOIRecommendation(body.question)) {
    try {
      // 检查是否需要基于位置的搜索
      const useLocationBasedSearch = needsLocationBasedSearch(body.question);
      
      // 从请求体中获取位置信息（由前端传入）
      const userCoords = body.coords || null;
      
      // 提取问题中的城市和省份
      const { city, province } = extractLocation(body.question);
      
      // 如果问题中明确指定了城市/省份，则优先使用问题中的位置
      // 否则如果是基于位置的搜索，使用用户位置
      const searchCity = city !== '北京' ? city : useLocationBasedSearch ? null : city;
      console.log('最终搜索城市:', searchCity, '省份:', province);
      console.log('是否使用位置搜索:', useLocationBasedSearch);
      console.log('用户坐标:', userCoords);
      
      const keywords = extractPOIKeywords(body.question);
      console.log('POI 搜索关键词:', keywords);
      
      // 使用百度地图进行POI搜索
      const poiResults = await searchBaiduPOI(
        keywords, 
        searchCity || '北京', 
        province, 
        (useLocationBasedSearch && userCoords) ? userCoords : undefined
      );
      
      if (poiResults && poiResults.length > 0) {
        console.log('成功获取 POI 结果! 共找到:', poiResults.length, '条记录');
        
        // 确定是否使用"附近"作为位置描述
        const isNearbySearch = useLocationBasedSearch && userCoords;
        const introduction = generatePOIIntroduction(body.question, city, province, isNearbySearch);
        const poiRecommendations = formatPOIRecommendations(poiResults);
        
        const escapedIntro = escapeSSEText(introduction);
        const escapedResults = escapeSSEText(poiRecommendations);
        
        event.node.res.write(`data: {"answer": "${escapedIntro}"}\n\n`);
        await new Promise(resolve => setTimeout(resolve, 300));
        event.node.res.write(`data: {"answer": "\\n\\n${escapedResults}"}\n\n`);
        
        event.node.res.write('event: close\ndata: [DONE]\n\n');
        event.node.res.end();
        return;
      }
      
      console.log('POI 搜索无结果，回退到大模型回答');
    } catch (error) {
      console.error('POI 推荐处理失败:', error);
    }
  }
  
  try {
    const response = await callZhipuAI(body.question, body.chatid);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API错误: ${response.status} ${errorText}`);
    }

    if (!response.body) {
      throw new Error('API没有返回流数据');
    }
    
    const reader = response.body.getReader();
    let decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          if (buffer.trim()) {
            processChunk(buffer, event.node.res);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          processChunk(line, event.node.res);
        }
      }
    } catch (error) {
      console.error('流处理错误:', error);
      event.node.res.write(`event: error\ndata: ${JSON.stringify({
        error: '流处理错误',
        message: error instanceof Error ? error.message : '未知错误'
      })}\n\n`);
    } finally {
      event.node.res.write('event: close\ndata: [DONE]\n\n');
      event.node.res.end();
    }

    event.node.req.on('close', () => {
      reader.cancel();
      console.log('客户端关闭连接');
    });
  } catch (error) {
    console.error('处理请求出错:', error);

    if (event.node.res.headersSent) {
      event.node.res.write(`event: error\ndata: ${JSON.stringify({
        error: '处理请求失败',
        message: error instanceof Error ? error.message : '未知错误'
      })}\n\n`);
      event.node.res.end();
      return;
    }

    return {
      error: '处理请求失败',
      message: error instanceof Error ? error.message : '未知错误',
      details: (error as any)?.response ? {
        status: (error as any).response.status,
        data: (error as any).response.data
      } : undefined
    };
  }
});