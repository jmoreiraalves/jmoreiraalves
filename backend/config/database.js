
module.exports = function (app) {

  var api = {};

  const { Pool } = require('pg');

  const config = {
    user    : process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port    : process.env.DB_PORT,
    host    : process.env.DB_HOST,
    ssl     : process.env.DB_SSL === 1 ? true : false
  };

  api.openDB = async function () {
    try {

      const pool = new Pool(config);

      pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
      });

      const client = await pool.connect();

      await client.query('BEGIN');

      return { pool, client };

    } catch (err) { throw err; }
  }

  api.closeDB = async function ({ pool, client }) {
    try {

      await client.query('COMMIT');
      client.release();
      await pool.end();

    } catch (err) { throw err; }
  }

  api.rollbackDB = async function ({ pool, client }) {
    try {

      await client.query('ROLLBACK');
      client.release();
      await pool.end();

    } catch (err) { throw err; }
  }

  api.execute = async function({ client, sql, params }) {
    try {

      if (!params) params = [];

      const result = await client.query(sql, params);

      return result;

    } catch (err) { throw err; }
  }

  api.insert = async function({ client, table, id, columns }) {
    try {

      const params = Object.keys(columns).map((v) => columns[v]);
      const keys   = Object.keys(columns).map((v) => v);
      const values = keys.map((v, i) => `$${i + 1}`);

      const sql = `INSERT INTO ${table}(${keys.join()}) VALUES(${values.join()}) RETURNING ${id}`;

      const result = await api.execute({ client, sql, params }).then(r => r.rows[0]);

      return result;

    } catch (err) { throw err; }
  }

  api.update = async function({ client, table, columns, conditions, parameters }) {
    try {

      const params = [
        ...Object.keys(columns   ).map((v) => columns[v]   ),
        ...Object.keys(parameters).map((v) => parameters[v])
      ];

      const keys = Object.keys(columns).map((v, i) => `${v} = $${i + 1}`);
      const reps = Object.keys(parameters).map((v, i) => { return { id: `$${v}`, value: `$${i + keys.length + 1}` } });

      reps.forEach(r => conditions = conditions.replace(r.id, r.value));

      const sql = `UPDATE ${table} SET ${keys.join()} WHERE ${conditions}`;

      const result = await api.execute({ client, sql, params }).then(r => r.rowCount);

      return result;

    } catch (err) { throw err; }
  }

  api.where = function ({ req, table, custom, notWhere, start }) {
    try {
      start = start || 1;

      let data = Object.assign({}, (custom) ? req.where : req.query);

      Object.keys(data).map(q => { if (!data[q] || Array.isArray(data[q])) delete data[q]; });

      const arCols = Object.keys(data).map((q, i) => {
        const arCol  = q.split('_');
        const prefix = (arCol.length > 1) ? arCol[0] : table;
        const column = (arCol.length > 1) ? arCol[1] : q;
        return `${prefix}.${column} = $${i + start}`;
      });

      const params = Object.keys(data).map(q => data[q]);

      const clause = (notWhere) ? 'AND' : 'WHERE';

      const where = (arCols.length) ? `${clause} ${arCols.join(' AND ')}` : '';

      return { params, where };

    } catch (err) { throw err; }
  }

  api.whereIn = function ({ req, table, custom, notWhere, start }) {
    try {
      start = start || 1;

      let data = Object.assign({}, (custom) ? req.where : req.query);

      Object.keys(data).map(q => { if (!data[q] || !(Array.isArray(data[q]) && data[q].length)) delete data[q]; });

      const arCols = Object.keys(data).map((q, i) => {
        const arCol  = q.split('_');
        const prefix = (arCol.length > 1) ? arCol[0] : table;
        const column = (arCol.length > 1) ? arCol[1] : q;
        const sqlIn  = data[q].map((d, j) => `$${i + j + start}`).join(', ');
        start = start + data[q].length;
        return `${prefix}.${column} IN (${sqlIn})`;
      });

      let params = [];
      Object.keys(data).map(q => params = [...params, ...data[q]]);

      const clause = (notWhere) ? 'AND' : 'WHERE';

      const where = (arCols.length) ? `${clause} ${arCols.join(' AND ')}` : '';

      return { params, where };

    } catch (err) { throw err; }
  }

  return api;

}