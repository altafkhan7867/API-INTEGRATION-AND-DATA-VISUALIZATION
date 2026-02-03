import requests
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from config import api_key
import base64
from io import BytesIO
import json

def fetch_weather(city):
    url = f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric'
    response = requests.get(url)
    data = response.json()
    
    # Extract the data we need
    weather_info = {
        'City': city,
        'Temperature': data['main']['temp'],
        'Feels_like': data['main']['feels_like'],
        'Humidity': data['main']['humidity'],
        'Pressure': data['main']['pressure'],
        'Wind_speed': data['wind']['speed'],
        'Description': data['weather'][0]['description']
    }
    return weather_info

# Fetch data for multiple cities
cities = ['London', 'New York', 'Tokyo', 'Paris', 'Mumbai', 'Sydney']
weather_data = []

for city in cities:
    print(f"Fetching weather for {city}...")
    weather_data.append(fetch_weather(city))

# Create a DataFrame(Table)
df = pd.DataFrame(weather_data)
print("\nWeather Data:")
print(df)


# ==================== HELPER FUNCTION ====================
def save_chart_as_base64(fig):
    """Convert matplotlib figure to base64 string for HTML embedding"""
    buffer = BytesIO()
    fig.savefig(buffer, format='png', dpi=150, bbox_inches='tight', facecolor='white')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.read()).decode()
    plt.close(fig)
    return f"data:image/png;base64,{image_base64}"


# ==================== ECO-FRIENDLY MODERN DASHBOARD ====================

# Set eco-friendly color palette
eco_colors = {
    'primary': '#2ecc71',
    'secondary': '#27ae60',
    'accent': '#3498db',
    'warm': '#f39c12',
    'cool': '#1abc9c',
    'background': '#ecf0f1'
}

# 1. MODERN CARD-STYLE TEMPERATURE DASHBOARD
print("\n📊 Creating Chart 1: Eco Weather Dashboard...")
fig1 = plt.figure(figsize=(16, 10), facecolor='white')
gs = fig1.add_gridspec(3, 3, hspace=0.3, wspace=0.3)

ax1 = fig1.add_subplot(gs[0:2, 0:2])
bars = ax1.barh(df['City'], df['Temperature'], color=eco_colors['primary'], 
                alpha=0.8, edgecolor='white', linewidth=2)
for i, (temp, city) in enumerate(zip(df['Temperature'], df['City'])):
    ax1.text(temp + 0.5, i, f"{temp}°C", va='center', fontweight='bold', fontsize=11)
ax1.set_xlabel('Temperature (°C)', fontsize=13, fontweight='bold', color='#2c3e50')
ax1.set_title('🌡️ Current Temperature by City', fontsize=15, fontweight='bold', 
              color='#2c3e50', pad=20)
ax1.spines['top'].set_visible(False)
ax1.spines['right'].set_visible(False)
ax1.set_facecolor('#f8f9fa')
ax1.grid(axis='x', alpha=0.3, linestyle='--')

ax2 = fig1.add_subplot(gs[0, 2])
avg_humidity = df['Humidity'].mean()
ax2.pie([avg_humidity, 100-avg_humidity], colors=[eco_colors['accent'], '#ecf0f1'],
        startangle=90, counterclock=False, wedgeprops={'edgecolor': 'white', 'linewidth': 2})
ax2.text(0, 0, f"{avg_humidity:.1f}%", ha='center', va='center', 
         fontsize=20, fontweight='bold', color='#2c3e50')
ax2.set_title('💧 Avg Humidity', fontsize=12, fontweight='bold', color='#2c3e50', pad=10)

ax3 = fig1.add_subplot(gs[1, 2])
avg_wind = df['Wind_speed'].mean()
ax3.pie([avg_wind, 20-avg_wind], colors=[eco_colors['cool'], '#ecf0f1'],
        startangle=90, counterclock=False, wedgeprops={'edgecolor': 'white', 'linewidth': 2})
ax3.text(0, 0, f"{avg_wind:.1f}\nm/s", ha='center', va='center', 
         fontsize=16, fontweight='bold', color='#2c3e50')
ax3.set_title('💨 Avg Wind Speed', fontsize=12, fontweight='bold', color='#2c3e50', pad=10)

ax4 = fig1.add_subplot(gs[2, :])
ax4.axis('off')
weather_text = "☀️ Current Conditions:\n"
for i, row in df.iterrows():
    weather_text += f"• {row['City']}: {row['Description'].title()} | "
ax4.text(0.5, 0.5, weather_text, ha='center', va='center', fontsize=11,
         bbox=dict(boxstyle='round,pad=1', facecolor=eco_colors['background'], 
                   edgecolor=eco_colors['primary'], linewidth=2),
         wrap=True, color='#2c3e50')

plt.suptitle('🌍 Eco Weather Dashboard', fontsize=18, fontweight='bold', 
             color=eco_colors['secondary'], y=0.98)
plt.savefig('eco_dashboard_modern.png', dpi=300, bbox_inches='tight', facecolor='white')
# THIS IS WHERE chart1 IS CREATED ↓
chart1 = save_chart_as_base64(fig1)
print("✅ Chart 1 created!")

# 2. MINIMALIST GRADIENT VISUALIZATION
print("📊 Creating Chart 2: Temperature Gradient...")
fig2, ax = plt.subplots(figsize=(14, 8), facecolor='white')

colors_gradient = plt.cm.RdYlGn_r(df['Temperature'] / df['Temperature'].max())
bars = ax.bar(df['City'], df['Temperature'], color=colors_gradient, 
              alpha=0.85, edgecolor='white', linewidth=3, width=0.6)

for bar, temp, feels in zip(bars, df['Temperature'], df['Feels_like']):
    height = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2., height + 1,
            f'{temp}°C\n(feels {feels}°C)',
            ha='center', va='bottom', fontsize=10, fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.5', facecolor='white', 
                      edgecolor=eco_colors['primary'], alpha=0.8))

ax.set_ylabel('Temperature (°C)', fontsize=14, fontweight='bold', color='#34495e')
ax.set_title('🌿 Temperature & Feels Like Comparison', fontsize=16, 
             fontweight='bold', color=eco_colors['secondary'], pad=20)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.set_facecolor('#f8f9fa')
ax.grid(axis='y', alpha=0.3, linestyle='--', color=eco_colors['primary'])
plt.xticks(rotation=0, fontsize=12, fontweight='bold')
plt.tight_layout()
plt.savefig('eco_temperature_gradient.png', dpi=300, bbox_inches='tight', facecolor='white')
# THIS IS WHERE chart2 IS CREATED ↓
chart2 = save_chart_as_base64(fig2)
print("✅ Chart 2 created!")

# 3. INTERACTIVE METRIC CARDS LAYOUT
print("📊 Creating Chart 3: Metric Cards...")
fig3, axes = plt.subplots(2, 3, figsize=(16, 10), facecolor='white')
fig3.patch.set_facecolor('white')

metrics = [
    ('Temperature', '🌡️', eco_colors['warm'], '°C'),
    ('Humidity', '💧', eco_colors['accent'], '%'),
    ('Wind_speed', '💨', eco_colors['cool'], 'm/s'),
    ('Pressure', '⏲️', eco_colors['secondary'], 'hPa'),
    ('Feels_like', '🤚', '#e74c3c', '°C')
]

for idx, (metric, emoji, color, unit) in enumerate(metrics):
    row = idx // 3
    col = idx % 3
    ax = axes[row, col]
    
    bars = ax.barh(df['City'], df[metric], color=color, alpha=0.7, 
                   edgecolor='white', linewidth=2, height=0.6)
    
    for i, (val, city) in enumerate(zip(df[metric], df['City'])):
        ax.text(val + max(df[metric])*0.02, i, f"{val:.1f}{unit}", 
                va='center', fontweight='bold', fontsize=10)
    
    ax.set_title(f'{emoji} {metric.replace("_", " ").title()}', 
                 fontsize=13, fontweight='bold', color='#2c3e50', pad=15)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_visible(False)
    ax.set_facecolor('#f8f9fa')
    ax.grid(axis='x', alpha=0.2, linestyle='--')
    ax.set_yticks(range(len(df)))
    ax.set_yticklabels(df['City'], fontsize=10)

axes[1, 2].axis('off')
axes[1, 2].text(0.5, 0.5, '🌍\nEco-Friendly\nWeather\nMonitoring', 
                ha='center', va='center', fontsize=16, fontweight='bold',
                color=eco_colors['secondary'],
                bbox=dict(boxstyle='round,pad=1.5', facecolor=eco_colors['background'],
                         edgecolor=eco_colors['primary'], linewidth=3))

plt.suptitle('🌱 Comprehensive Weather Metrics', fontsize=18, fontweight='bold',
             color=eco_colors['secondary'], y=0.98)
plt.tight_layout()
plt.savefig('eco_metrics_cards.png', dpi=300, bbox_inches='tight', facecolor='white')
# THIS IS WHERE chart3 IS CREATED ↓
chart3 = save_chart_as_base64(fig3)
print("✅ Chart 3 created!")

print("\n✅ All visualizations created!")
print("🌿 Modern, clean, and professional dashboard generated!")
print("📊 PNG files saved with 'eco_' prefix")


