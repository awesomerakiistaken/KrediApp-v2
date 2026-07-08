using KrediApp.ML;

var dataPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "statlog+german+credit+data", "german.data");
var modelPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "KrediApp.Api", "RiskModel.zip");

ModelBuilder.TrainAndSaveModel(Path.GetFullPath(dataPath), Path.GetFullPath(modelPath));
