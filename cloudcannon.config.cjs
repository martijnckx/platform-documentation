const path = require("path");
const fs = require("fs");
const { matter } = require("md-front-matter");
const fg = require("fast-glob");

const common_content_structures = [];

const common_content_files = fg.sync([
  path.join(__dirname, "_common_content/**/*.mdx"),
]);

console.log(`Loading common content from ${common_content_files.join(", ")}`);

for (const common_content_file of common_content_files) {
  const file_content = fs.readFileSync(common_content_file, {
    encoding: "utf8",
  });
  const { data } = matter(file_content);

  const structure_value = {
    label: data.content_name,
    preview: {
      text: [data.content_name],
    },
    value: {
      _file: common_content_file,
    },
    _inputs: {},
  };

  for (const [param, settings] of Object.entries(data.parameters)) {
    structure_value.value[param] = null;
    structure_value._inputs[param] = {
      type: settings.type,
      comment: settings.comment,
    };
  }

  common_content_structures.push(structure_value);
}

const _snippets = {
  ...require(path.join(__dirname, ".cloudcannon/snippets/code_block.json")),
  ...require(path.join(__dirname, ".cloudcannon/snippets/conditional.json")),
  ...require(path.join(__dirname, ".cloudcannon/snippets/data_reference.json")),
  ...require(path.join(__dirname, ".cloudcannon/snippets/docs_image.json")),
  ...require(path.join(
    __dirname,
    ".cloudcannon/snippets/multi_code_block.json"
  )),
  ...require(path.join(__dirname, ".cloudcannon/snippets/notice.json")),
  ...require(path.join(__dirname, ".cloudcannon/snippets/tabs.json")),
  ...require(path.join(__dirname, ".cloudcannon/snippets/youtube.json")),
  ...require(path.join(__dirname, ".cloudcannon/snippets/common_content.json")),
  ...require(path.join(
    __dirname,
    ".cloudcannon/snippets/common_content_param.json"
  )),
  ...require(path.join(__dirname, ".cloudcannon/snippets/slot.json")),
};

module.exports = {
  _snippets_imports: {
    mdx: true,
  },
  _snippets,
  collections_config: {
    common_content: {
      dam_uploads_filename: "[collection|slugify]/{date|year}/{date|month}/[asset-filename]"
      path: "_common_content",
      output: false,
      icon: "copy_all",
      parser: "front-matter",
      schemas: {
        default: {
          path: ".cloudcannon/schemas/common_content.mdx",
        },
      },
      _inputs: {
        content_name: {
          comment:
            "Give this piece of reusable content a descriptive name, as this is what you will select when inserting it in a page",
        },
        parameters: {
          type: "object",
          comment: "Define any keys you created in Substitution snippets here",
          options: {
            subtype: "mutable",
            entries: {
              structures: {
                values: [
                  {
                    value: {
                      comment: null,
                      type: null,
                    },
                    _inputs: {
                      comment: {
                        comment:
                          "Text that will be shown alongside this parameter when using this piece of custom content",
                      },
                      type: {
                        comment:
                          "The CloudCannon input type that should be used for editing this parameter",
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },
    articles: {
      path: "articles",
      output: true,
      icon: "article",
      url: "/articles/[slug]/",
      parser: "front-matter",
      schemas: {
        default: {
          path: ".cloudcannon/schemas/article.mdx",
        },
      },
    },
    guides: {
      path: "guides",
      output: true,
      icon: "school",
      url: "/guides/[relative_base_path]/[slug]/",
      parser: "front-matter",
    },
    changelog: {
      path: "changelogs",
      output: true,
      icon: "tips_and_updates",
      url: (filePath) => {
        const regex =
          /^changelogs\/([0-9]{4})\-([0-9]{2})\-([0-9]{2})_(.+)\.mdx?/;
        const [, year, month, day, slug] = filePath.match(regex) || [];
        return `/changelog/${year}/${month}/${day}/${slug}.html`;
      },
      parser: "front-matter",
      sort: {
        key: "path",
        order: "desc",
      },
      create: {
        path: "{date|year}-{date|month}-{date|day}_{title|slugify}.[ext]",
        _inputs: {
          date: {
            instance_value: "NOW",
          },
        },
      },
      schemas: {
        default: {
          path: ".cloudcannon/schemas/changelog.mdx",
        },
      },
    },
    data: {
      path: "_data",
      filter: {
        base: "none",
        include: ["navigation.yml", "meta.yml", "headingnav.yml", "ssgs.yml"],
      },
    },
  },
  _editables: {
    content: {
      format: true,
      blockquote: true,
      bold: true,
      italic: true,
      strike: true,
      subscript: true,
      superscript: true,
      underline: true,
      link: true,
      bulletedlist: true,
      numberedlist: true,
      code: true,
      embed: true,
      horizontalrule: true,
      table: true,
      snippet: true,
    },
  },
  _structures: {
    related_links: {
      values: {
        value: {
          name: "",
          url: "",
        },
      },
    },
    common_content_types: {
      values: common_content_structures,
    },
  },
  _inputs: {
    _created_at: {
      instance_value: "NOW",
    },
    _uuid: {
      instance_value: "UUID",
    },
  },
  commit_templates: [{ template_string: "{message}" }],
  timezone: "Pacific/Auckland",
  base_url: "documentation",
};
