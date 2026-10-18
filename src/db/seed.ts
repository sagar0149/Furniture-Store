import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

async function seed() {
  console.log("🌱 Starting database seed...\n");

  const { db } = await import("./index");

    const {
    users,
    categories,
    products,
    storeSettings,
    socialLinks,
    businessHours,
    footerSections,
    shippingSettings,
    paymentProviderSettings,
  } = await import("./schema");

  const bcrypt = (await import("bcryptjs")).default;

  /*
   * ==========================================
   * 1. USERS
   * ==========================================
   */

  console.log("👤 Seeding users...");

  const adminPasswordHash = await bcrypt.hash(
    "Admin@12345",
    12,
  );

  const customerPasswordHash = await bcrypt.hash(
    "Customer@12345",
    12,
  );

  await db
    .insert(users)
    .values({
      name: "Store Administrator",
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      phone: "+919999999999",
      role: "ADMIN",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        name: "Store Administrator",
        role: "ADMIN",
        isActive: true,
        updatedAt: new Date(),
      },
    });

  await db
    .insert(users)
    .values({
      name: "Demo Customer",
      email: "customer@example.com",
      passwordHash: customerPasswordHash,
      phone: "+918888888888",
      role: "CUSTOMER",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        name: "Demo Customer",
        role: "CUSTOMER",
        isActive: true,
        updatedAt: new Date(),
      },
    });

  console.log("   ✓ Admin user");
  console.log("   ✓ Customer user");

  /*
   * ==========================================
   * 2. STORE SETTINGS
   * ==========================================
   */

  console.log("\n🏪 Seeding store settings...");

  const existingStore =
    await db
      .select()
      .from(storeSettings)
      .limit(1);

  if (existingStore.length === 0) {
    await db.insert(storeSettings).values({
      storeName: "UrbanNest Furniture",

      tagline:
        "Furniture Designed for Modern Living",

      description:
        "Premium furniture designed to bring comfort, style, and functionality to modern homes.",

      primaryEmail: "hello@example.com",

      secondaryEmail: "support@example.com",

      phone: "+919999999999",

      whatsapp: "+919999999999",

      customerSupportPhone: "+919999999999",

      addressLine1: "123 Furniture Street",

      addressLine2: "Near City Center",

      city: "Bhubaneswar",

      state: "Odisha",

      postalCode: "751001",

      country: "India",

      latitude: "20.2961000",

      longitude: "85.8245000",

      googleMapsUrl:
        "https://maps.google.com/",

      footerDescription:
        "Premium furniture for modern homes and beautiful living spaces.",

      copyrightText:
        "© 2026 UrbanNest Furniture. All rights reserved.",

      seoTitle:
        "UrbanNest Furniture | Premium Furniture for Modern Living",

      seoDescription:
        "Discover premium furniture for modern homes including sofas, beds, dining tables, chairs, desks, and more.",

      seoKeywords:
        "furniture, sofa, bed, dining table, chairs, home furniture",

      ogTitle:
        "UrbanNest Furniture",

      ogDescription:
        "Premium furniture designed for modern living.",
    });

    console.log("   ✓ Store settings");
  } else {
    console.log("   ✓ Store settings already exist");
  }

  /*
   * ==========================================
   * 3. SOCIAL LINKS
   * ==========================================
   */

  console.log("\n📱 Seeding social links...");

  const socialData = [
    {
      platform: "FACEBOOK" as const,
      url: "https://facebook.com/",
      displayOrder: 1,
    },
    {
      platform: "INSTAGRAM" as const,
      url: "https://instagram.com/",
      displayOrder: 2,
    },
    {
      platform: "TIKTOK" as const,
      url: "https://tiktok.com/",
      displayOrder: 3,
    },
    {
      platform: "YOUTUBE" as const,
      url: "https://youtube.com/",
      displayOrder: 4,
    },
    {
      platform: "LINKEDIN" as const,
      url: "https://linkedin.com/",
      displayOrder: 5,
    },
    {
      platform: "PINTEREST" as const,
      url: "https://pinterest.com/",
      displayOrder: 6,
    },
    {
      platform: "X" as const,
      url: "https://x.com/",
      displayOrder: 7,
    },
    {
      platform: "WHATSAPP" as const,
      url: "https://wa.me/919999999999",
      displayOrder: 8,
    },
  ];

  for (const social of socialData) {
    await db
      .insert(socialLinks)
      .values({
        platform: social.platform,
        url: social.url,
        enabled: true,
        displayOrder: social.displayOrder,
      })
      .onConflictDoUpdate({
        target: socialLinks.platform,
        set: {
          url: social.url,
          enabled: true,
          displayOrder: social.displayOrder,
          updatedAt: new Date(),
        },
      });
  }

  console.log("   ✓ 8 social links");

  /*
   * ==========================================
   * 4. BUSINESS HOURS
   * ==========================================
   */

  console.log("\n🕒 Seeding business hours...");

  const hoursData = [
    {
      dayOfWeek: 0,
      isOpen: false,
      openingTime: null,
      closingTime: null,
    },
    {
      dayOfWeek: 1,
      isOpen: true,
      openingTime: "09:00",
      closingTime: "19:00",
    },
    {
      dayOfWeek: 2,
      isOpen: true,
      openingTime: "09:00",
      closingTime: "19:00",
    },
    {
      dayOfWeek: 3,
      isOpen: true,
      openingTime: "09:00",
      closingTime: "19:00",
    },
    {
      dayOfWeek: 4,
      isOpen: true,
      openingTime: "09:00",
      closingTime: "19:00",
    },
    {
      dayOfWeek: 5,
      isOpen: true,
      openingTime: "09:00",
      closingTime: "19:00",
    },
    {
      dayOfWeek: 6,
      isOpen: true,
      openingTime: "10:00",
      closingTime: "18:00",
    },
  ];

  for (const hour of hoursData) {
    await db
      .insert(businessHours)
      .values(hour)
      .onConflictDoUpdate({
        target: businessHours.dayOfWeek,
        set: {
          isOpen: hour.isOpen,
          openingTime: hour.openingTime,
          closingTime: hour.closingTime,
          updatedAt: new Date(),
        },
      });
  }

  console.log("   ✓ 7 business-hour records");

  /*
   * ==========================================
   * 5. FOOTER SECTIONS
   * ==========================================
   */

  console.log("\n📑 Seeding footer sections...");

  const footerData = [
    {
      title: "Customer Service",
      links: [
        {
          label: "Contact Us",
          url: "/contact",
        },
        {
          label: "Shipping Information",
          url: "/shipping",
        },
        {
          label: "Returns",
          url: "/returns",
        },
      ],
      displayOrder: 1,
    },

    {
      title: "Company",
      links: [
        {
          label: "About Us",
          url: "/about",
        },
        {
          label: "Our Collection",
          url: "/products",
        },
      ],
      displayOrder: 2,
    },

    {
      title: "Account",
      links: [
        {
          label: "My Account",
          url: "/account",
        },
        {
          label: "Orders",
          url: "/account/orders",
        },
        {
          label: "Wishlist",
          url: "/account/wishlist",
        },
      ],
      displayOrder: 3,
    },
  ];

  const existingFooterSections =
    await db
      .select()
      .from(footerSections);

  for (const footer of footerData) {
    const exists =
      existingFooterSections.some(
        (section) =>
          section.title === footer.title,
      );

    if (!exists) {
      await db.insert(footerSections).values({
        title: footer.title,
        links: footer.links,
        enabled: true,
        displayOrder: footer.displayOrder,
      });
    }
  }

  console.log("   ✓ Footer sections");

  /*
   * ==========================================
   * 6. SHIPPING SETTINGS
   * ==========================================
   */

  console.log("\n🚚 Seeding shipping settings...");

  const existingShipping =
    await db
      .select()
      .from(shippingSettings)
      .limit(1);

  if (existingShipping.length === 0) {
    await db.insert(shippingSettings).values({
      shippingEnabled: true,

      freeShippingThreshold: "50000",

      defaultShippingFee: "2000",

      shippingInformation:
        "Furniture orders are carefully packed and delivered safely to your address.",

      estimatedDeliveryMessage:
        "Estimated delivery: 5–10 business days.",
    });

    console.log("   ✓ Shipping settings");
  } else {
    console.log(
      "   ✓ Shipping settings already exist",
    );
  }
      /*
   * ==========================================
   * 7. PAYMENT PROVIDERS
   * ==========================================
   */

  console.log("\n💳 Seeding payment providers...");

  const paymentProviders = [
    {
      provider: "STRIPE" as const,
      isEnabled: false,
      isDefault: false,
      description:
        "Credit and debit card payments through Stripe.",
    },

    {
      provider: "PAYPAL" as const,
      isEnabled: false,
      isDefault: false,
      description:
        "PayPal payments for supported countries and currencies.",
    },

    {
      provider: "ESEWA" as const,
      isEnabled: false,
      isDefault: false,
      description:
        "eSewa payments for Nepal.",
    },

    {
      provider: "KHALTI" as const,
      isEnabled: false,
      isDefault: false,
      description:
        "Khalti payments for Nepal.",
    },

    {
      provider: "COD" as const,
      isEnabled: true,
      isDefault: true,
      description:
        "Cash on delivery.",
    },
  ];

  for (const paymentProvider of paymentProviders) {
    const existingProvider =
      await db
        .select()
        .from(paymentProviderSettings)
        .where(
          (
            await import("drizzle-orm")
          ).eq(
            paymentProviderSettings.provider,
            paymentProvider.provider,
          ),
        )
        .limit(1);

    if (existingProvider.length === 0) {
      await db
        .insert(paymentProviderSettings)
        .values(paymentProvider);

      console.log(
        `   ✓ ${paymentProvider.provider}`,
      );
    } else {
      console.log(
        `   ✓ ${paymentProvider.provider} already exists`,
      );
    }
  }

  console.log(
    "   ✓ Payment providers initialized",
  );



  /*
   * ==========================================
   * 7. CATEGORIES
   * ==========================================
   */

  console.log("\n🗂️ Seeding categories...");

  const categoryData = [
    {
      name: "Sofas",
      slug: "sofas",
      description:
        "Comfortable and stylish sofas for modern living rooms.",
      displayOrder: 1,
    },

    {
      name: "Beds",
      slug: "beds",
      description:
        "Premium beds designed for comfort and relaxation.",
      displayOrder: 2,
    },

    {
      name: "Dining Tables",
      slug: "dining-tables",
      description:
        "Elegant dining tables for memorable meals.",
      displayOrder: 3,
    },

    {
      name: "Chairs",
      slug: "chairs",
      description:
        "Modern chairs for dining, living, and working.",
      displayOrder: 4,
    },

    {
      name: "Coffee Tables",
      slug: "coffee-tables",
      description:
        "Beautiful coffee tables for contemporary spaces.",
      displayOrder: 5,
    },

    {
      name: "Cabinets",
      slug: "cabinets",
      description:
        "Functional storage cabinets with premium finishes.",
      displayOrder: 6,
    },

    {
      name: "Office Furniture",
      slug: "office-furniture",
      description:
        "Furniture designed for productive workspaces.",
      displayOrder: 7,
    },

    {
      name: "Outdoor Furniture",
      slug: "outdoor-furniture",
      description:
        "Durable furniture for outdoor spaces.",
      displayOrder: 8,
    },
  ];

  const categoryRecords = [];

  for (const category of categoryData) {
    const [record] = await db
      .insert(categories)
      .values({
        name: category.name,
        slug: category.slug,
        description: category.description,
        displayOrder: category.displayOrder,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: categories.slug,
        set: {
          name: category.name,
          description: category.description,
          displayOrder: category.displayOrder,
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    categoryRecords.push(record);
  }

  console.log("   ✓ 8 categories");

  /*
   * ==========================================
   * 8. PRODUCTS
   * ==========================================
   */

  console.log("\n🛋️ Seeding products...");

  const categoryMap = new Map(
    categoryRecords.map((category) => [
      category.slug,
      category.id,
    ]),
  );

  const productData = [
    {
      name: "Oslo Lounge Sofa",
      slug: "oslo-lounge-sofa",
      sku: "URN-SOF-001",
      category: "sofas",
      regularPrice: "65000",
      salePrice: "54999",
      material: "Premium Fabric",
      color: "Warm Beige",
      dimensions: "220 × 90 × 85 cm",
      weight: "48.00",
      stockQuantity: 12,
      lowStockThreshold: 3,
      isFeatured: true,
    },

    {
      name: "Nordic Oak Dining Table",
      slug: "nordic-oak-dining-table",
      sku: "URN-DIN-001",
      category: "dining-tables",
      regularPrice: "48000",
      salePrice: "41999",
      material: "Solid Oak",
      color: "Natural Oak",
      dimensions: "180 × 90 × 76 cm",
      weight: "65.00",
      stockQuantity: 8,
      lowStockThreshold: 2,
      isFeatured: true,
    },

    {
      name: "Aria Lounge Chair",
      slug: "aria-lounge-chair",
      sku: "URN-CHR-001",
      category: "chairs",
      regularPrice: "22000",
      salePrice: "18999",
      material: "Wood and Fabric",
      color: "Olive Green",
      dimensions: "78 × 82 × 85 cm",
      weight: "14.00",
      stockQuantity: 18,
      lowStockThreshold: 4,
      isFeatured: true,
    },

    {
      name: "Haven King Bed",
      slug: "haven-king-bed",
      sku: "URN-BED-001",
      category: "beds",
      regularPrice: "72000",
      salePrice: "64999",
      material: "Engineered Wood",
      color: "Walnut",
      dimensions: "210 × 190 × 110 cm",
      weight: "85.00",
      stockQuantity: 6,
      lowStockThreshold: 2,
      isFeatured: true,
    },

    {
      name: "Linea Coffee Table",
      slug: "linea-coffee-table",
      sku: "URN-COF-001",
      category: "coffee-tables",
      regularPrice: "18000",
      salePrice: "14999",
      material: "Oak and Glass",
      color: "Natural",
      dimensions: "120 × 60 × 45 cm",
      weight: "22.00",
      stockQuantity: 15,
      lowStockThreshold: 3,
      isFeatured: false,
    },

    {
      name: "Monaco Sideboard",
      slug: "monaco-sideboard",
      sku: "URN-CAB-001",
      category: "cabinets",
      regularPrice: "56000",
      salePrice: "47999",
      material: "Engineered Wood",
      color: "Dark Walnut",
      dimensions: "180 × 45 × 80 cm",
      weight: "58.00",
      stockQuantity: 7,
      lowStockThreshold: 2,
      isFeatured: true,
    },

    {
      name: "Luna Accent Chair",
      slug: "luna-accent-chair",
      sku: "URN-CHR-002",
      category: "chairs",
      regularPrice: "24000",
      salePrice: "19999",
      material: "Premium Fabric",
      color: "Terracotta",
      dimensions: "80 × 78 × 85 cm",
      weight: "15.00",
      stockQuantity: 11,
      lowStockThreshold: 3,
      isFeatured: false,
    },

    {
      name: "Atlas Work Desk",
      slug: "atlas-work-desk",
      sku: "URN-OFF-001",
      category: "office-furniture",
      regularPrice: "32000",
      salePrice: "27999",
      material: "Solid Wood",
      color: "Walnut",
      dimensions: "140 × 70 × 75 cm",
      weight: "35.00",
      stockQuantity: 10,
      lowStockThreshold: 3,
      isFeatured: true,
    },

    {
      name: "Milan Three Seater Sofa",
      slug: "milan-three-seater-sofa",
      sku: "URN-SOF-002",
      category: "sofas",
      regularPrice: "78000",
      salePrice: "69999",
      material: "Premium Fabric",
      color: "Charcoal",
      dimensions: "240 × 95 × 85 cm",
      weight: "55.00",
      stockQuantity: 5,
      lowStockThreshold: 2,
      isFeatured: true,
    },

    {
      name: "Verona Queen Bed",
      slug: "verona-queen-bed",
      sku: "URN-BED-002",
      category: "beds",
      regularPrice: "58000",
      salePrice: "49999",
      material: "Solid Wood",
      color: "Natural Oak",
      dimensions: "210 × 160 × 105 cm",
      weight: "70.00",
      stockQuantity: 9,
      lowStockThreshold: 2,
      isFeatured: false,
    },

    {
      name: "Eden Outdoor Chair",
      slug: "eden-outdoor-chair",
      sku: "URN-OUT-001",
      category: "outdoor-furniture",
      regularPrice: "12000",
      salePrice: "9999",
      material: "Weather Resistant Wood",
      color: "Natural",
      dimensions: "65 × 70 × 80 cm",
      weight: "9.00",
      stockQuantity: 20,
      lowStockThreshold: 5,
      isFeatured: false,
    },

    {
      name: "Sol Outdoor Table",
      slug: "sol-outdoor-table",
      sku: "URN-OUT-002",
      category: "outdoor-furniture",
      regularPrice: "28000",
      salePrice: "23999",
      material: "Teak Wood",
      color: "Natural Teak",
      dimensions: "150 × 90 × 75 cm",
      weight: "32.00",
      stockQuantity: 8,
      lowStockThreshold: 2,
      isFeatured: false,
    },

    {
      name: "Nova Storage Cabinet",
      slug: "nova-storage-cabinet",
      sku: "URN-CAB-002",
      category: "cabinets",
      regularPrice: "42000",
      salePrice: "35999",
      material: "Engineered Wood",
      color: "Warm White",
      dimensions: "120 × 45 × 160 cm",
      weight: "48.00",
      stockQuantity: 13,
      lowStockThreshold: 3,
      isFeatured: false,
    },

    {
      name: "Forma Executive Desk",
      slug: "forma-executive-desk",
      sku: "URN-OFF-002",
      category: "office-furniture",
      regularPrice: "52000",
      salePrice: "44999",
      material: "Solid Wood",
      color: "Dark Walnut",
      dimensions: "180 × 80 × 76 cm",
      weight: "48.00",
      stockQuantity: 4,
      lowStockThreshold: 2,
      isFeatured: true,
    },

    {
      name: "Eames Style Dining Chair",
      slug: "eames-style-dining-chair",
      sku: "URN-CHR-003",
      category: "chairs",
      regularPrice: "9500",
      salePrice: "7999",
      material: "Wood and Fabric",
      color: "Cream",
      dimensions: "52 × 55 × 82 cm",
      weight: "7.00",
      stockQuantity: 25,
      lowStockThreshold: 5,
      isFeatured: false,
    },

    {
      name: "Marble Edge Coffee Table",
      slug: "marble-edge-coffee-table",
      sku: "URN-COF-002",
      category: "coffee-tables",
      regularPrice: "36000",
      salePrice: "29999",
      material: "Marble and Metal",
      color: "White",
      dimensions: "110 × 60 × 42 cm",
      weight: "40.00",
      stockQuantity: 6,
      lowStockThreshold: 2,
      isFeatured: true,
    },

    {
      name: "Cloud Modular Sofa",
      slug: "cloud-modular-sofa",
      sku: "URN-SOF-003",
      category: "sofas",
      regularPrice: "110000",
      salePrice: "94999",
      material: "Premium Upholstery",
      color: "Off White",
      dimensions: "280 × 100 × 85 cm",
      weight: "72.00",
      stockQuantity: 3,
      lowStockThreshold: 1,
      isFeatured: true,
    },

    {
      name: "Horizon Bedside Table",
      slug: "horizon-bedside-table",
      sku: "URN-CAB-003",
      category: "cabinets",
      regularPrice: "14000",
      salePrice: "11999",
      material: "Oak Wood",
      color: "Natural Oak",
      dimensions: "50 × 40 × 55 cm",
      weight: "12.00",
      stockQuantity: 17,
      lowStockThreshold: 4,
      isFeatured: false,
    },

    {
      name: "Studio Office Chair",
      slug: "studio-office-chair",
      sku: "URN-OFF-003",
      category: "office-furniture",
      regularPrice: "26000",
      salePrice: "21999",
      material: "Mesh and Metal",
      color: "Charcoal",
      dimensions: "65 × 65 × 110 cm",
      weight: "12.00",
      stockQuantity: 14,
      lowStockThreshold: 3,
      isFeatured: false,
    },

    {
      name: "Terra Outdoor Lounge",
      slug: "terra-outdoor-lounge",
      sku: "URN-OUT-003",
      category: "outdoor-furniture",
      regularPrice: "44000",
      salePrice: "37999",
      material: "Teak and Fabric",
      color: "Natural",
      dimensions: "180 × 80 × 75 cm",
      weight: "30.00",
      stockQuantity: 5,
      lowStockThreshold: 2,
      isFeatured: false,
    },
  ];

  for (const product of productData) {
    const categoryId = categoryMap.get(
      product.category,
    );

    if (!categoryId) {
      throw new Error(
        `Category not found: ${product.category}`,
      );
    }

    await db
      .insert(products)
      .values({
        name: product.name,
        slug: product.slug,

        description:
          `${product.name} is thoughtfully designed for modern interiors, combining comfort, functionality, and timeless style.`,

        sku: product.sku,

        brand: "UrbanNest",

        categoryId,

        regularPrice: product.regularPrice,

        salePrice: product.salePrice,

        stockQuantity:
          product.stockQuantity,

        lowStockThreshold:
          product.lowStockThreshold,

        material: product.material,

        color: product.color,

        dimensions:
          product.dimensions,

        weight: product.weight,

        assemblyInformation:
          "Professional assembly recommended.",

        shippingInformation:
          "Carefully packaged and delivered to your address.",

        returnInformation:
          "Eligible for return according to store return policy.",

        isFeatured:
          product.isFeatured,

        isActive: true,
      })
      .onConflictDoUpdate({
        target: products.slug,

        set: {
          name: product.name,

          description:
            `${product.name} is thoughtfully designed for modern interiors, combining comfort, functionality, and timeless style.`,

          categoryId,

          regularPrice:
            product.regularPrice,

          salePrice:
            product.salePrice,

          stockQuantity:
            product.stockQuantity,

          lowStockThreshold:
            product.lowStockThreshold,

          material:
            product.material,

          color:
            product.color,

          dimensions:
            product.dimensions,

          weight:
            product.weight,

          isFeatured:
            product.isFeatured,

          isActive: true,

          updatedAt: new Date(),
        },
      });
  }

  console.log("   ✓ 20 products");

  /*
   * ==========================================
   * COMPLETE
   * ==========================================
   */

  console.log(
    "\n========================================",
  );

  console.log(
    "🎉 DATABASE SEED COMPLETED SUCCESSFULLY",
  );

  console.log(
    "========================================\n",
  );

  console.log("Development Admin:");
  console.log("Email: admin@example.com");
  console.log("Password: Admin@12345\n");

  console.log("Development Customer:");
  console.log("Email: customer@example.com");
  console.log("Password: Customer@12345\n");

  console.log(
    "⚠️ These credentials are for development only.",
  );
}

seed().catch((error) => {
  console.error(
    "\n❌ DATABASE SEED FAILED:",
  );

  console.error(error);

  process.exit(1);
});