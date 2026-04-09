from selenium import webdriver 
from selenium.webdriver.chrome.service import Service 
from selenium.webdriver.chrome.options import Options 
from selenium.webdriver.common.by import By 
from selenium.webdriver.support.ui import WebDriverWait 
from selenium.webdriver.support import expected_conditions as EC 
import time 

def get_flashscore_content(url): 
 # 配置 Chrome 选项 
 chrome_options = Options() 
 chrome_options.add_argument("--headless") # 无头模式，不显示浏览器界面 
 chrome_options.add_argument("--disable-gpu") 
 chrome_options.add_argument("--no-sandbox") 
 chrome_options.add_argument("--disable-dev-shm-usage") 

 # 指定 ChromeDriver 的路径（你需要根据你的安装位置修改） 
 service = Service('/Users/rongyingjie/Documents/chrome-headless-shell-mac-arm64') 
 # 如果你的 ChromeDriver 已经在 PATH 环境变量中，可以不指定路径 
 driver = webdriver.Chrome(options=chrome_options) 

 try: 
  print(f"正在访问网页: {url}") 
  driver.get(url) 

 # 等待页面加载完成，可以等待某个特定元素出现 
  WebDriverWait(driver, 10).until( 
  EC.presence_of_element_located((By.ID, "live-table")) # Flashscore页面上比赛列表的ID 
  ) 

  print("页面加载完成，尝试获取内容...") 

 # 获取页面的所有可见文本内容 
  page_content = driver.find_element(By.TAG_NAME, "body").text 

 # 你也可以尝试获取更具体的元素内容，例如： 
 # matches_container = driver.find_element(By.ID, "live-table") 
 # match_info = matches_container.text 

  return page_content 

 except Exception as e: 
  print(f"获取网页内容时发生错误: {e}") 
  return None 
 finally: 
  driver.quit() # 关闭浏览器 

if __name__ == "__main__": 
 flashscore_url = "https://www.flashscore.com/" 
 content = get_flashscore_content(flashscore_url) 
 if content: 
 # 为了避免输出过长，只打印部分内容或保存到文件 
  print("--- 网页内容（部分）---") 
  print(content[:3000]) # 打印前2000个字符 
 # with open("flashscore_content.txt", "w", encoding="utf-8") as f: 
 # f.write(content) 
 # print("内容已保存到 flashscore_content.txt") 
 else: 
  print("未能获取网页内容。")