const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

const nftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A NFT muss eine Haben"],
      unique: true,
      trim: true,
      maxlength: [40, "NFT Name darf nicht mehr als 40 Zeichen haben"],
      minlength: [6, "Nft Name muss mindestens 6 Zeichen haben"],
     // validate: [validator.isAlpha,"NFT Name KANN NUR Zeichen HABEn, keine Number"],

    },
    slug: String,
    duration: {
      type: String,
      required: [true, "Aktuelle Dauer muss eine Haben "],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Aktuelle Größe muss eine Gruppe Haben"],
    },
    difficulty: {
      type: String,
      required: [true, "Aktuelle Dauer muss eine Gruppe Haben"],
      enum: {
        values: ["easy", "medium", "difficulty"],
        message: "Die Schwierigkeit ist entweder: leicht, mittel oder schwer.",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [1, "mindestens 1 EXTERNE vergeben"],
      max: [5, "maximal 5 EXTERNE vergeben"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A NFT muss ein Preis haben"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "Rabattpreis sollte({VALUE}) unter dem regulären Preis liegen.",
      },
    },
    summary: {
      type: String,
      required: [true, "A NFT muss provide the summary"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      trim: true,
      required: [true, "A NFT muss provide the image cover"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretNfts: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virutals: true },
  }
);

nftSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});
//mongoose middleware

//Document middleware: runs before .save() or create()
nftSchema.pre("save", function (next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// nftSchema.pre("save", function (next) {
//   console.log("document se esta guardando o se guardo como a ti te guste");
//   next();
// });

// nftSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY middleware
///---PRE
nftSchema.pre(/^find/, function (next) {
  this.find({ secretNfts: { $ne: true } });
  this.start = Date.now();

  next();
});

// nftSchema.pre("findOne", function (next) {
//   this.find({ secretNfts: { $ne: true } });
//   next();
// });

//QUERY middleware
///---POST
nftSchema.post(/^find/, function (doc, next) {
  console.log(`QUERY TOOK TIME: ${Date.now() - this.start} times`);
  // console.log(doc);
  next();
});
///--AGGREGATE MIDDLEWARE
nftSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretNfts: { $ne: true } } });
  //console.log(this.pipeline());
  next();
});
const NFT = mongoose.model("NFT", nftSchema);

module.exports = NFT;
