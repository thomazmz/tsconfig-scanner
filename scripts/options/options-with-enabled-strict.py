import os
import pymongo
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from matplotlib.ticker import ScalarFormatter

MONGODB_URL = "mongodb+srv://thomazmz:***@production.vtctzdd.mongodb.net/"

# Connect to MongoDB
mongodb_client = pymongo.MongoClient(MONGODB_URL)
mongodb_database = mongodb_client['production']
mongodb_collection = mongodb_database['scanning_results']

# Fetch the documents with required fields
documents = mongodb_collection.find(
    {"typescriptOptions.strict": True},
    {"_id": 0, "typescriptOptions": 1}
)

# Convert to DataFrame
data = []
for doc in documents:
    typescript_options = doc.get('typescriptOptions', {})
    data.append(typescript_options)
df = pd.DataFrame(data)

# Count the number of filtered documents
filtered_documents_count = len(df)

# List of strict options
strict_options = [
    # "strict",
    "alwaysStrict",
    "strictNullChecks",
    "strictBindCallApply",
    "strictFunctionTypes",
    "strictPropertyInitialization",
    "noImplicitAny",
    "noImplicitThis",
    "useUnknownInCatchVariables",
]

# Filter DataFrame to include only strict options
df_strict = df[strict_options]

# Calculate the sum of each strict TypeScript compiler option
strict_option_counts = df_strict.sum().sort_values(ascending=False)

# Plot the distribution of strict options with logarithmic scale
plt.figure(figsize=(14, 8))
ax = strict_option_counts.plot(kind='bar', logy=True)
plt.title(f'Usage of Strict TypeScript Compiler Options Across Projects When Strict Is True ({filtered_documents_count} repositories)')
plt.xlabel('TypeScript Compiler Options')
plt.ylabel('Number of Repositories (log scale)')
plt.xticks(rotation=45, ha='right')

# Customize the y-axis labels to be more readable
ax.yaxis.set_major_formatter(ScalarFormatter(useMathText=True))
ax.yaxis.set_minor_formatter(ScalarFormatter(useMathText=True))

# Add counts on top of each bar
for index, value in enumerate(strict_option_counts):
    ax.text(index, value, str(int(value)), ha='center', va='bottom')

plt.grid(True, which="both", ls="--")
plt.tight_layout()

# Save the plot in the same directory as the script
script_dir = os.path.dirname(os.path.abspath(__file__))
output_file = os.path.join(script_dir, "options-with-enabled-strict.png")
plt.savefig(output_file)