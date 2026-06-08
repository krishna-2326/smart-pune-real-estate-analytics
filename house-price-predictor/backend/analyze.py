import pandas as pd
from sklearn.preprocessing import LabelEncoder

df = pd.read_csv("c:/Users/Krishna Gite/Desktop/pune_house/pune_house_prices.csv")
if 'id' in df.columns:
    df = df.drop(columns=['id'])

le = LabelEncoder()
df['area_encoded'] = le.fit_transform(df['area'])

import numpy as np
print("Correlation Matrix:")
numeric_df = df.select_dtypes(include=[np.number])
print(numeric_df.corr()['price'])

print("\nValue Counts for Areas:")
print(df['area'].value_counts())
