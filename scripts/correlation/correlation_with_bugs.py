import pymongo
from pymongo import MongoClient
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import matplotlib.pyplot as plt
import seaborn as sns

uri = "mongodb+srv://thomazmz:***@production.vtctzdd.mongodb.net/"

client = MongoClient(uri)

db = client['production']

collection = db['scanning_results']

documents = list(collection.find())

client.close()

documents_data_frame = pd.json_normalize(documents)

cleaned_documents_data_frame = documents_data_frame.dropna()

sonarMetric = 'sonarMetrics.bugs'

features = [
    'typescriptOptions.allowUnreachableCode',
    'typescriptOptions.allowUnusedLabels',
    'typescriptOptions.exactOptionalPropertyTypes',
    'typescriptOptions.noFallthroughCasesInSwitch',
    'typescriptOptions.noImplicitOverride',
    'typescriptOptions.noImplicitReturns',
    'typescriptOptions.noPropertyAccessFromIndexSignature',
    'typescriptOptions.noUncheckedIndexedAccess',
    'typescriptOptions.noUnusedLocals',
    'typescriptOptions.noUnusedParameters',
    'typescriptOptions.noImplicitAny',
    'typescriptOptions.noImplicitThis',
    'typescriptOptions.strict',
    'typescriptOptions.alwaysStrict',
    'typescriptOptions.strictNullChecks',
    'typescriptOptions.strictBindCallApply',
    'typescriptOptions.strictFunctionTypes',
    'typescriptOptions.strictPropertyInitialization',
    'typescriptOptions.useUnknownInCatchVariables',
    sonarMetric
]

x = cleaned_documents_data_frame[features]

# Calculate the correlation matrix
# correlation_matrix = x.corr() * 1
correlation_matrix = x.corr() * -1

# Focus on the correlation of each option with bugs
bugs_correlation = correlation_matrix[sonarMetric].drop(sonarMetric)

# Convert correlation results to a DataFrame for easier handling
correlation_df = bugs_correlation.sort_values(ascending=False).reset_index()
correlation_df.columns = ['TypeScriptOption', 'CorrelationWithBugs']

# Plotting the correlations
plt.figure(figsize=(10, 8))
sns.barplot(data=correlation_df, x='CorrelationWithBugs', y='TypeScriptOption', palette='coolwarm')
plt.title('Correlation of TypeScript Options with ' + sonarMetric)
plt.xlabel('Correlation with ' + sonarMetric)
plt.ylabel('TypeScript Options')
plt.tight_layout()
plt.show()
