const path = require("path");
const webpack = require("webpack");
const HTMLWebpackPlubgin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerWebpackPlugin = require("css-minimizer-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");

// Переменные для определения режима сборки
const isDevelop = process.env.NODE_ENV === "development";
const isProduction = !isDevelop;

// Функция для подстановки плагинов по минимизации при работе в среде Production
const optimization = () => {
  const config = {
    // Оптимизация размеров файлов путем разделения на чанки all | async | initial
    splitChunks: {
      chunks: "all",
    },

    runtimeChunk: "single",
  };

  if (isProduction) {
    config.minimizer =
      //Минимизация CSS
      [new CssMinimizerPlugin(), new TerserWebpackPlugin()];
  }
  return config;
};

// Массив плагинов для подключения
const plugins = [
  // Генерация html файла при сборке с использованием исходного шаблона
  new HTMLWebpackPlubgin({
    template: "./index.html",

    // Один из вариантов добавления иконки
    favicon: "./favicon.ico",
    minify: {
      collapseWhitespace: isProduction,
    },
  }),

  // Автоматическая очистка директории с бандлами
  new CleanWebpackPlugin(),

  // Копирование файлов в html
  new CopyPlugin(
    {
      // Массив с информацией о файлах для переноса
      patterns: [
        {
          from: path.resolve(__dirname, "src/favicon.ico"),
          to: path.resolve(__dirname, "dist"),
        },
      ],
    },
    // Копировать без изменений
    {
      copyUnmodified: true,
    }
  ),

  // Выделение css в отдельные файлы бандла
  new MiniCssExtractPlugin({
    filename: isProduction
      ? "[name].[contenthash].style.css"
      : "[name].style.css",
  }),

  // Оптимизация css файлов
  new CssMinimizerWebpackPlugin(),
];

// HotModuleReplacement
if (isDevelop) {
  plugins.push(new webpack.HotModuleReplacementPlugin());
  // Сорсмапы
  plugins.push(
    new webpack.SourceMapDevToolPlugin({
      filename: "[name].[contenthash].map",
    })
  );
}

// Экспортируем конфигурацию для пакета Webpack
module.exports = {
  // Дефолтный режим для сборки
  mode: "development",

  // Дефолтная директория для поиска исходных файлов приложения
  context: path.resolve(__dirname, "src"),

  // Конфигурация дев сервера вебпак
  devServer: {
    port: 3000,

    // Hot module replacement только для режима разработки
    // hot: isDevelop,

    // Запись на диск вместо использования оперативной памяти при разработке
    devMiddleware: { writeToDisk: true },
  },

  // Инструменты разработчика - перенесены в плагины
  devtool: false,

  // Входные файлы
  entry: {
    // Главная точка входа в приложение
    main: ["@babel/polyfill", "./index.tsx"],

    // Сторонний скрипт
    analytics: "./analytics.ts",
  },

  // Локация результата работы wp
  output: {
    // При нескольких загружаемых скриптах в точке входа,
    // используются паттерны вебпака для наименования файлов
    filename: isProduction
      ? "[name].[contenthash].bundle.js"
      : "[name].bundle.js",

    //Альтернативная очистка директории с бандлами начиная с 5 версии wp
    clean: true,
    path: path.resolve(__dirname, "dist"),
  },

  // С какими расширениями работает вебпак по умолчанию
  resolve: {
    // Для того чтобы не писать расширения в импортах
    extensions: [
      ".ts",
      ".js",
      ".jsx",
      ".tsx",
      ".json",
      ".png",
      ".svg",
      ".csv",
      ".css",
    ],

    // Быстрый доступ к любому рабочему каталогу, чтобы исключчить ../../../../.....
    alias: {
      //Примеры
      "@root": path.resolve(__dirname, "src"),
      "@store": path.resolve(__dirname, "src/store"),
    },
  },

  // Раздел оптимизации размера бандла
  optimization: optimization(),
  // Подключение плагинов для работы с бандлами

  // Подключенные плагины
  plugins,

  // Подключаемые модули, лоадеры
  module: {
    rules: [
      //Babel
      {
        test: /\.m?js$/,

        // Исключаем исходники библиотек из компиляции babel
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: ["@babel/plugin-proposal-class-properties"],
          },
        },
      },
      {
        test: /\.m?ts$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-typescript"],
            plugins: ["@babel/plugin-proposal-class-properties"],
          },
        },
      },

      {
        test: /\.(j|t)sx$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-typescript",
              "@babel/preset-react",
            ],
            plugins: ["@babel/plugin-proposal-class-properties"],
          },
        },
      },

      {
        // Для всех файлов с расширением стилей
        test: /\.css$/,
        // Порядок использования лоадеров в массиве - справа налево
        // "style-loader" добавит стили в исходный html файл в раздел head
        // use: ["style-loader", "css-loader"],

        // С использованием плагина экстрактора
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
          "postcss-loader",
        ],
      },

      // sass
      {
        test: /\.s(a|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
          "sass-loader",
        ],
      },

      // less
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
          "less-loader",
        ],
      },

      //Изображения
      {
        test: /\.(png|svg|jpg|jpeg|ico|gif)$/i,
        type: "asset/resource",
      },

      //Шрифты
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: ["file-loader"],

        //Для устранения ошибок декодирования кастомных шрифтов при локальном использовании
        dependency: { not: ["url"] },
      },

      //XML
      {
        test: /\.xml$/,
        use: ["xml-loader"],
      },

      //CSV
      {
        test: /\.csv$/,
        use: ["csv-loader"],
      },
    ],
  },
};
