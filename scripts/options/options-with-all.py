import os
import pymongo
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

MONGODB_URL = "mongodb+srv://thomazmz:***@production.vtctzdd.mongodb.net/"

# Connect to MongoDB
mongodb_client = pymongo.MongoClient(MONGODB_URL)
mongodb_database = mongodb_client['production']
mongodb_collection = mongodb_database['scanning_results']

# Fetch the documents with required fields
documents = mongodb_collection.find(
    {},
    {"_id": 0, "typescriptOptions": 1}
)

# Convert to DataFrame
data = []
for doc in documents:
    typescript_options = doc.get('typescriptOptions', {})
    data.append(typescript_options)
df = pd.DataFrame(data)

# Count the total number of documents
total_documents = len(df)

# Calculate the sum of each TypeScript compiler option
compiler_option_counts = df.sum().sort_values(ascending=False)

# List of strict options
strict_options = [
  "strict",
  "alwaysStrict",
  "strictNullChecks",
  "strictBindCallApply",
  "strictFunctionTypes",
  "strictPropertyInitialization",
  "noImplicitAny",
  "noImplicitThis",
  "useUnknownInCatchVariables",
]

# Plot the distribution
plt.figure(figsize=(14, 8))
ax = compiler_option_counts.plot(kind='bar')
plt.title(f'Usage of TypeScript Compiler Options Across Projects ({total_documents} repositories)')
plt.xlabel('TypeScript Compiler Options (strict compiler options marked in bold)')
plt.ylabel('Number of Repositories')
plt.xticks(rotation=45, ha='right')

# Customize x-axis labels to bold the strict options
labels = ax.get_xticklabels()
new_labels = []
for label in labels:
    option = label.get_text()
    if option in strict_options:
        new_labels.append(f"$\\bf{{{option}}}$")
    else:
        new_labels.append(option)
ax.set_xticklabels(new_labels)

# Add counts on top of each bar
for index, value in enumerate(compiler_option_counts):
    ax.text(index, value, str(int(value)), ha='center', va='bottom')

plt.grid(True)
plt.tight_layout()  # Adjust layout to ensure everything fits without overlap

# Save the plot in the same directory as the script
script_dir = os.path.dirname(os.path.abspath(__file__))
output_file = os.path.join(script_dir, "options-with-all.png")
plt.savefig(output_file)
