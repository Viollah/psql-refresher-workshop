const PgPromise = require('pg-promise');
const assert = require('assert');
const fs = require('fs');

require('dotenv').config();

describe('As part of the sql refresh workshop', () => {
  const DATABASE_URL = process.env.DATABASE_URL;

  const pgp = PgPromise({});
  const db = pgp(DATABASE_URL);

  before(async () => {
    await db.none(`delete from garment`);
    const commandText = fs.readFileSync('./sql/data.sql', 'utf-8');
    await db.none(commandText);
  });

  it('you should create a garment table in the database', async () => {
    // use db.one
    const result = await db.one(`select count(*) from garment;`);

    // no changes below this line in this function
    assert.ok(result.count);
  });

  it('there should be 30 garments in the garment table - added using the supplied script', async () => {
    // use db.one as 1 result us expected
    const result = await db.one(`select count(*) from garment;`);
    // no changes below this line in this function

    assert.equal(30, result.count);
  });

  it('you should be able to find all the Summer garments', async () => {
    // add some code below
    const result = await db.one(
      `select count(*) from garment where season = $1;`,
      'Summer',
    );
    // no changes below this line in this function
    assert.equal(12, result.count);
  });

  it('you should be able to find all the Winter garments', async () => {
    // add some code below
    const result = await db.one(
      `select count(*) from garment where season = $1;`,
      'Winter',
    );
    // no changes below this line in this function
    assert.equal(5, result.count);
  });

  it('you should be able to find all the Winter Male garments', async () => {
    // change the code statement below
    const result = await db.one(
      `select count(*) from garment where season = $1 and gender = $2;`,
      ['Winter', 'Male'],
    );
    // no changes below this line in this function
    assert.equal(3, result.count);
  });

  it('you should be able to change a given Male garment to a Unisex garment', async () => {
    // use db.one with an update sql statement
    const result = await db.one(
      `update garment set gender = $1 where gender = $2 and description = $3 returning $4`,
      ['Unisex', 'Male', 'Red hooded jacket', 'sucess'],
    );
    // write your code above this line

    const gender_sql = 'select gender from garment where description = $1';
    const gender = await db.one(
      gender_sql,
      ['Red hooded jacket'],
      (r) => r.gender,
    );
    assert.equal('Unisex', gender);
  });

  it('you should be able to add 2 Male & 3 Female garments', async () => {
    // use db.none - change code below here...
    const garment_add_sql = `insert into garment(description, img, season, gender, price) values ($1,$2,$3,$4,$5);`;
    db.none(garment_add_sql, [
      'Golf t-shirt',
      'collared-128x128-455119.png',
      'Summer',
      'Male',
      '147.43',
    ]);
    db.none(garment_add_sql, [
      'Blue Jersey',
      'sweater-128x128-455131.png',
      'Winter',
      'Male',
      '499.99',
    ]);
    db.none(garment_add_sql, [
      'Purple Dress',
      'tunic-128x128-455137.png',
      'Summer',
      'Female',
      '399.99',
    ]);
    db.none(garment_add_sql, [
      'Short Skirt(Yellow)',
      'skirt-128x128-455130.png',
      'Summer',
      'Female',
      '199.99',
    ]);
    db.none(garment_add_sql, [
      'Short Skirt(Pink)',
      'skirt-128x128-455130.png',
      'Summer',
      'Female',
      '199.99',
    ]);

    // write your code above this line

    const gender_count_sql = 'select count(*) from garment where gender = $1';
    const maleCount = await db.one(gender_count_sql, ['Male'], (r) => r.count);
    const femaleCount = await db.one(
      gender_count_sql,
      ['Female'],
      (r) => r.count,
    );

    
    assert.equal(15, maleCount);
    assert.equal(16, femaleCount);
  });

  it('you should be group garments by gender and count them', async () => {
    // and below this line for this function will
    const garmentsGrouped = await db.many(
      `select count(*), gender from garment group by gender order by gender asc`,
    );
    // write your code above this line

    const expectedResult = [
      {
        count: '16',
        gender: 'Female',
      },
      {
        count: '15',
        gender: 'Male',
      },
      {
        count: '4',
        gender: 'Unisex',
      },
    ];
    assert.deepStrictEqual(expectedResult, garmentsGrouped);
  });

  it('you should be able to remove all the Unisex garments', async () => {
    // and below this line for this function will
    await db.none(`delete from garment where gender = $1`, 'Unisex');
    // write your code above this line

    const gender_count_sql = 'select count(*) from garment where gender = $1';
    const unisexCount = await db.one(
      gender_count_sql,
      ['Unisex'],
      (r) => r.count,
    );

    assert.equal(0, unisexCount);
  });

  after(async () => {
    db.$pool.end();
  });
}).timeout(5000);
