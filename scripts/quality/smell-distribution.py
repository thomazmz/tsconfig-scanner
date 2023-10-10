import os
import pymongo
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

MONGODB_URL = "mongodb+srv://thomazmz:***@production.vtctzdd.mongodb.net/"

# Connect to MongoDB
mongodb_client = pymongo.MongoClient(MONGODB_URL)
mongodbDatabase = mongodb_client['production']
mongodb_collection = mongodbDatabase['scanning_results']

# Count the total number of documents in the collection
total_documents = mongodb_collection.count_documents({})

# Fetch the documents with required fields and filtering
documents = mongodb_collection.find(
    {"sonarMetrics.smells": {"$gte": 1}},
    {"_id": 0, "sonarMetrics.smells": 1, "sonarMetrics.lines": 1}
)

# Convert to DataFrame
data = []
for doc in documents:
    sonar_metrics = doc.get('sonarMetrics', {})
    data.append({
        'smells': sonar_metrics.get('smells', 0),
        'lines': sonar_metrics.get('lines', 0)
    })
df = pd.DataFrame(data)

# Calculate the number of smells per 100 lines of code
df['smells_per_1000_lines'] = (df['smells'] / df['lines']) * 1000

# Remove outliers using IQR method
Q1 = df['smells_per_1000_lines'].quantile(0.25)
Q3 = df['smells_per_1000_lines'].quantile(0.75)
IQR = Q3 - Q1
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

df_filtered = df[(df['smells_per_1000_lines'] >= lower_bound) & (df['smells_per_1000_lines'] <= upper_bound)]

# Get the total number of repositories represented in the graph
total_filtered_documents = df_filtered.shape[0]

# Plot the distribution
plt.figure(figsize=(10, 6))
sns.histplot(df_filtered['smells_per_1000_lines'], bins=30, kde=True)
plt.title(f'Distribution of smells per 1000 Lines of code (smells/kloc)\nIncluding repositories with at least one smell ({total_filtered_documents} out of {total_documents} repositories)')
plt.xlabel('smells/kloc')
plt.ylabel('Frequency')
plt.grid(True)

# Save the plot in the same directory as the script
script_dir = os.path.dirname(os.path.abspath(__file__))
output_file = os.path.join(script_dir, "smell-distribution.png")
plt.savefig(output_file)