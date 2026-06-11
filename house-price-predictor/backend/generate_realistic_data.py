import os
import random
import pandas as pd
import numpy as np

def main():
    print("Generating realistic Pune housing dataset with higher variance...")
    
    areas = ['Viman Nagar', 'Kalyani Nagar', 'Pimpri-Chinchwad', 'Hinjewadi', 'Koregaon Park']
    
    base_rates = {
        'Koregaon Park': 12000,
        'Kalyani Nagar': 10000,
        'Viman Nagar': 8000,
        'Pimpri-Chinchwad': 6000,
        'Hinjewadi': 5200
    }
    
    data = []
    num_records = 15000
    
    for idx in range(1, num_records + 1):
        area = random.choice(areas)
        bhk = random.choice([1, 2, 3, 4, 5])
        
        if bhk == 1:
            sqft = random.randint(500, 750)
            bathrooms = random.choice([1, 2])
            garage_prob = 0.3
        elif bhk == 2:
            sqft = random.randint(800, 1150)
            bathrooms = 2
            garage_prob = 0.5
        elif bhk == 3:
            sqft = random.randint(1200, 1700)
            bathrooms = random.choice([2, 3])
            garage_prob = 0.75
        elif bhk == 4:
            sqft = random.randint(1800, 2600)
            bathrooms = random.choice([3, 4])
            garage_prob = 0.9
        else: # 5 BHK
            sqft = random.randint(2700, 4200)
            bathrooms = random.choice([4, 5])
            garage_prob = 0.95
            
        year_built = random.randint(1990, 2026)
        has_garage = 1 if random.random() < garage_prob else 0
        
        # Calculate price based on real estate logic
        base_rate = base_rates[area]
        price = sqft * base_rate
        
        # Add value for layout
        price += bhk * 350000
        price += bathrooms * 150000
        price += has_garage * 250000
        
        # Apply depreciation based on house age
        age = 2026 - year_built
        depreciation = min(0.20, age * 0.005)
        price = price * (1 - depreciation)
        
        # Add a much higher natural ±15% market fluctuation noise (simulates premium buildings vs standard ones)
        noise = random.uniform(0.85, 1.15)
        price = int(price * noise)
        
        data.append({
            'id': idx,
            'area': area,
            'square_feet': sqft,
            'num_bedrooms': bhk,
            'num_bathrooms': bathrooms,
            'year_built': year_built,
            'has_garage': has_garage,
            'price': price
        })
        
    df = pd.DataFrame(data)
    
    target_path = "c:/Users/Krishna Gite/Desktop/pune_house/pune_house_prices.csv"
    df.to_csv(target_path, index=False)
    
    print(f"Successfully generated and wrote {num_records} rows of high-variance data to {target_path}")

if __name__ == "__main__":
    main()
